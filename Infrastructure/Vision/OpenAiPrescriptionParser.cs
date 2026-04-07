using System.ClientModel;
using System.Text.Json;
using System.Text.Json.Nodes;
using Application.Interfaces;
using Application.Prescriptions.DTOs;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using OpenAI;
using OpenAI.Chat;

namespace Infrastructure.Vision;

/// <summary>
/// Uses OpenAI Chat Completions (JSON mode) to parse a raw OCR text into a structured
/// <see cref="PrescriptionOcrResultDto"/>, replacing the fragile regex-based parser.
/// </summary>
public sealed class OpenAiPrescriptionParser(
    IOptions<OpenAiSettings> options,
    ILogger<OpenAiPrescriptionParser> logger) : ILlmPrescriptionParser
{
    // -------------------------------------------------------------------------
    // System prompt — instructs GPT to return strict JSON only.
    // -------------------------------------------------------------------------
    private const string SystemPrompt = """
        You are a medical prescription parser specialising in eyeglass/optical prescriptions.
        You will receive raw OCR text extracted from a prescription image.

        Your task:
        1. Identify the RIGHT eye (OD) and LEFT eye (OS) sections.
        2. Extract SPH (sphere), CYL (cylinder), AXIS, ADD (addition), and PD (pupillary distance).
        3. Return ONLY a valid JSON object — no markdown, no explanation.

        Rules:
        - Values must be strings (e.g. "-1.25", "+0.50", "180").
        - If a field cannot be found, use JSON null.
        - SPH and CYL can be negative (e.g. "-2.00") or positive (e.g. "+1.50").
        - AXIS is an integer 1-180.
        - PD can be a single binocular value (e.g. "62") or split monocular "right/left" (e.g. "31/30").
        - ADD is always positive (e.g. "+2.00").
        - confidence must be one of: "high", "medium", "low".
          - "high"   → all critical fields (SPH, CYL, AXIS for both eyes) found with high certainty.
          - "medium" → most fields found but some missing or uncertain.
          - "low"    → very few fields found or text is too ambiguous.
        - warnings is an array of short strings describing any issues you noticed.

        JSON schema to return:
        {
          "rightEye": {
            "sph":  "<string | null>",
            "cyl":  "<string | null>",
            "axis": "<string | null>",
            "add":  "<string | null>",
            "pd":   "<string | null>"
          },
          "leftEye": {
            "sph":  "<string | null>",
            "cyl":  "<string | null>",
            "axis": "<string | null>",
            "add":  "<string | null>",
            "pd":   "<string | null>"
          },
          "pd":         "<string | null>",
          "confidence": "high | medium | low",
          "warnings":   ["<string>"]
        }
        """;

    private const decimal HighConfidenceScore = 0.92m;
    private const decimal MediumConfidenceScore = 0.72m;
    private const decimal LowConfidenceScore = 0.40m;

    private readonly OpenAiSettings _settings = options.Value;

    // ---------------------------------------------------------------------------
    public async Task<PrescriptionOcrResultDto> ParseAsync(
        string rawOcrText,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(rawOcrText))
        {
            logger.LogWarning("LLM parser received empty OCR text.");
            return EmptyFailureResult(["No text was extracted from the image."]);
        }

        try
        {
            string jsonResponse = await CallOpenAiAsync(rawOcrText, cancellationToken);
            return MapJsonToDto(jsonResponse, rawOcrText);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "LLM prescription parsing failed.");
            return EmptyFailureResult([$"LLM parsing error: {ex.Message}"], rawOcrText);
        }
    }

    // ---------------------------------------------------------------------------
    // Private helpers
    // ---------------------------------------------------------------------------

    private async Task<string> CallOpenAiAsync(string ocrText, CancellationToken ct)
    {
        OpenAIClient client = new(_settings.ApiKey);
        ChatClient chatClient = client.GetChatClient(_settings.Model);

        ChatCompletionOptions chatOptions = new()
        {
            ResponseFormat = ChatResponseFormat.CreateJsonObjectFormat()
        };

        List<ChatMessage> messages =
        [
            new SystemChatMessage(SystemPrompt),
            new UserChatMessage($"OCR Text:\n{ocrText}")
        ];


        ClientResult<ChatCompletion> response =
            await chatClient.CompleteChatAsync(messages, chatOptions, ct);

        if (response.Value.Content.Count == 0)
        {
            throw new InvalidOperationException("OpenAI returned no content in response.");
        }

        string content = response.Value.Content[0].Text;

        return content;
    }

    private PrescriptionOcrResultDto MapJsonToDto(string json, string rawText)
    {
        JsonNode? root;
        try
        {
            root = JsonNode.Parse(json);
        }
        catch (JsonException ex)
        {
            logger.LogError(ex, "Failed to parse OpenAI JSON response.");
            return EmptyFailureResult(["LLM returned invalid JSON."]);
        }

        if (root is null)
            return EmptyFailureResult(["LLM returned null JSON."]);

        // ---- Eyes ----
        ExtractedPrescriptionValueDto? rightEye = MapEyeNode(root["rightEye"]);
        ExtractedPrescriptionValueDto? leftEye = MapEyeNode(root["leftEye"]);

        // ---- Binocular PD ----
        OcrFieldDto? binocularPd = null;
        string? pdValue = GetSafeStringValue(root["pd"]);
        if (!string.IsNullOrWhiteSpace(pdValue))
        {
            binocularPd = new OcrFieldDto { Value = pdValue, Confidence = 0.95m, IsExtracted = true };

            // If it's a split PD (e.g. "31/30"), distribute to each eye
            if (pdValue.Contains('/'))
            {
                string[] parts = pdValue.Split('/', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries);
                if (parts.Length == 2)
                {
                    if (rightEye is not null)
                        rightEye.PD ??= new OcrFieldDto { Value = parts[0], Confidence = 0.95m, IsExtracted = true };
                    if (leftEye is not null)
                        leftEye.PD ??= new OcrFieldDto { Value = parts[1], Confidence = 0.95m, IsExtracted = true };

                    binocularPd = null; // No top-level PD for split format
                }
            }
        }

        // ---- Confidence ----
        string confidenceStr = GetSafeStringValue(root["confidence"]) ?? "low";
        (OcrConfidenceLevel level, decimal score) = MapConfidence(confidenceStr);

        // Recalculate weighted eye confidence and blend with LLM confidence
        decimal rightScore = rightEye?.OverallConfidence ?? 0m;
        decimal leftScore = leftEye?.OverallConfidence ?? 0m;

        decimal eyeAvg = (rightEye is not null && leftEye is not null)
            ? (rightScore + leftScore) / 2m
            : Math.Max(rightScore, leftScore);

        // Blend: 60% LLM confidence signal + 40% field-level confidence
        decimal blended = (score * 0.6m) + (eyeAvg * 0.4m);

        // ---- Warnings ----
        List<string> warnings = [];
        JsonArray? warningsNode = root["warnings"]?.AsArray();
        if (warningsNode is not null)
        {
            foreach (JsonNode? w in warningsNode)
            {
                string? wStr = GetSafeStringValue(w);
                if (!string.IsNullOrWhiteSpace(wStr))
                    warnings.Add(wStr);
            }
        }

        bool parsedSuccessfully = blended >= 0.60m;

        return new PrescriptionOcrResultDto
        {
            ImageUrl = string.Empty,  // Set by command handler
            PublicId = string.Empty,  // Set by command handler
            RawText = rawText,
            RightEye = rightEye,
            LeftEye = leftEye,
            PD = binocularPd,
            ConfidenceLevel = level,
            OverallConfidence = Math.Round(blended, 4),
            ParsedSuccessfully = parsedSuccessfully,
            Warnings = warnings
        };
    }

    /// <summary>Maps a JSON eye node to <see cref="ExtractedPrescriptionValueDto"/>.</summary>
    private static ExtractedPrescriptionValueDto? MapEyeNode(JsonNode? node)
    {
        if (node is null) return null;

        ExtractedPrescriptionValueDto eye = new();

        eye.SPH  = ToField(GetSafeStringValue(node["sph"]));
        eye.CYL  = ToField(GetSafeStringValue(node["cyl"]));
        eye.AXIS = ToField(GetSafeStringValue(node["axis"]));
        eye.ADD  = ToField(GetSafeStringValue(node["add"]));
        eye.PD   = ToField(GetSafeStringValue(node["pd"]));

        // Compute per-eye confidence: each extracted field contributes a weight.
        // Weights mirror AzureVisionService constants: SPH 37%, CYL 27%, AXIS 18%, ADD 8%, PD 10%
        decimal confidence =
            (eye.SPH is not null ? 0.37m : 0m) +
            (eye.CYL is not null ? 0.27m : 0m) +
            (eye.AXIS is not null ? 0.18m : 0m) +
            (eye.ADD is not null ? 0.08m : 0m) +
            (eye.PD is not null ? 0.10m : 0m);

        eye.OverallConfidence = confidence;

        // Return null when no fields were found
        bool hasAny = eye.SPH is not null || eye.CYL is not null ||
                      eye.AXIS is not null || eye.ADD is not null || eye.PD is not null;

        return hasAny ? eye : null;
    }

    /// <summary>
    /// Safely extracts a string from any <see cref="JsonNode"/> regardless of its underlying
    /// JSON type (string, number, boolean). Prevents <see cref="InvalidOperationException"/>
    /// when the LLM returns a numeric literal (e.g. 62) instead of a quoted string ("62").
    /// </summary>
    private static string? GetSafeStringValue(JsonNode? node)
    {
        if (node is null) return null;

        // JsonValue covers strings, numbers, booleans — ToString() always produces a clean value.
        // JsonObject / JsonArray are ignored (not a scalar value).
        return node is JsonValue jv ? jv.ToString() : null;
    }

    private static OcrFieldDto? ToField(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return null;

        return new OcrFieldDto
        {
            Value = value.Trim(),
            Confidence = 0.95m,  // LLM extracted — we trust it highly
            IsExtracted = true
        };
    }

    private static (OcrConfidenceLevel Level, decimal Score) MapConfidence(string raw) =>
        raw.ToLowerInvariant() switch
        {
            "high" => (OcrConfidenceLevel.High, HighConfidenceScore),
            "medium" => (OcrConfidenceLevel.Medium, MediumConfidenceScore),
            _ => (OcrConfidenceLevel.Low, LowConfidenceScore)
        };

    private static PrescriptionOcrResultDto EmptyFailureResult(
        List<string> warnings,
        string? rawOcrText = null) =>
        new()
        {
            ImageUrl           = string.Empty,
            PublicId           = string.Empty,
            RawText            = string.IsNullOrWhiteSpace(rawOcrText) ? string.Empty : rawOcrText,
            RightEye           = null,
            LeftEye            = null,
            PD                 = null,
            ConfidenceLevel    = OcrConfidenceLevel.Low,
            OverallConfidence  = 0m,
            ParsedSuccessfully = false,
            Warnings           = warnings
        };
}
