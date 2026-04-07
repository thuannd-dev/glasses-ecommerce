using System.Text;
using System.Text.RegularExpressions;
using Application.Interfaces;
using Application.Prescriptions.DTOs;
using Azure.AI.Vision.ImageAnalysis;
using Domain;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Infrastructure.Vision;

public sealed class AzureVisionService(
    ImageAnalysisClient imageAnalysisClient,
    IOptions<VisionSettings> settings,
    ILogger<AzureVisionService> logger) : IAzureVisionService
{
    private const decimal MediumFieldConfidence = 0.80m;
    private const decimal MediumOverallConfidenceThreshold = 0.60m;
    private const decimal HighOverallConfidenceThreshold = 0.85m;
    private const decimal SphWeight = 0.40m;
    private const decimal CylWeight = 0.30m;
    private const decimal AxisWeight = 0.20m;
    private const decimal AddWeight = 0.10m;

    private static readonly Regex RightEyeLabelRegex = new(
        @"\b(?:O\.?D\.?|RIGHT|R)\b",
        RegexOptions.IgnoreCase | RegexOptions.Compiled);

    private static readonly Regex LeftEyeLabelRegex = new(
        @"\b(?:O\.?S\.?|LEFT|L)\b",
        RegexOptions.IgnoreCase | RegexOptions.Compiled);

    private static readonly Regex SphRegex = new(
        @"\b(?:SPH|SPHERE)\b[:\s]*([+-]?(?:\d*\.\d+|\d+))",
        RegexOptions.IgnoreCase | RegexOptions.Compiled);

    private static readonly Regex CylRegex = new(
        @"\b(?:CYL|CYLINDER)\b[:\s]*([+-]?(?:\d*\.\d+|\d+))",
        RegexOptions.IgnoreCase | RegexOptions.Compiled);

    private static readonly Regex AxisRegex = new(
        @"\b(?:AXIS|AX)\b[:\s]*(\d{1,3})",
        RegexOptions.IgnoreCase | RegexOptions.Compiled);

    private static readonly Regex PdRegex = new(
        @"\b(?:PD|P\.?D\.?)\b[:\s]*((?:\d{2,3}(?:\.\d+)?)|(?:\d{2,3}(?:\.\d+)?\s*/\s*\d{2,3}(?:\.\d+)?))",
        RegexOptions.IgnoreCase | RegexOptions.Compiled);

    private static readonly Regex AddRegex = new(
        @"\b(?:ADD|ADDITION)\b[:\s]*([+]?(?:\d*\.\d+|\d+))",
        RegexOptions.IgnoreCase | RegexOptions.Compiled);

    private static readonly Regex NumericRowRegex = new(
        @"^.*?([+-]?\d+\.\d+)\s+([+-]?\d+\.\d+)(?:\s+(\d{1,3}))?.*$",
        RegexOptions.Compiled);

    private static readonly Regex NumericTokenRegex = new(
        @"[+-]?[0-9OILSB]+(?:\.[0-9OILSB]+)?|[+-]?\.[0-9OILSB]+",
        RegexOptions.IgnoreCase | RegexOptions.Compiled);

    private static readonly Regex RightEyeSegmentRegex = new(
        @"\b(?:O\.?D\.?|RIGHT|R)\b(?<values>.{0,120}?)(?=\b(?:O\.?S\.?|LEFT|L)\b|$)",
        RegexOptions.IgnoreCase | RegexOptions.Compiled);

    private static readonly Regex LeftEyeSegmentRegex = new(
        @"\b(?:O\.?S\.?|LEFT|L)\b(?<values>.{0,120}?)(?=\b(?:O\.?D\.?|RIGHT|R)\b|$)",
        RegexOptions.IgnoreCase | RegexOptions.Compiled);

    private readonly VisionSettings _settings = settings.Value;
    private readonly ImageAnalysisClient _imageAnalysisClient = imageAnalysisClient;

    public async Task<PrescriptionOcrResultDto> ReadPrescriptionFromImageUrlAsync(
        string imageUrl,
        CancellationToken cancellationToken = default)
    {
        try
        {
            // Analyze image from URL (Read API)
            ImageAnalysisResult result = await _imageAnalysisClient.AnalyzeAsync(
                new Uri(imageUrl),
                VisualFeatures.Read,
                cancellationToken: cancellationToken);

            // Extract all text lines
            StringBuilder rawTextBuilder = new StringBuilder();
            List<OcrReadLine> allLines = [];

            if (result.Read?.Blocks != null)
            {
                foreach (DetectedTextBlock block in result.Read.Blocks)
                {
                    foreach (DetectedTextLine line in block.Lines)
                    {
                        string lineText = line.Text;
                        string normalizedLineText = NormalizeText(lineText);
                        (decimal centerX, decimal centerY) = GetLineCenter(line.BoundingPolygon);
                        decimal lineConfidence = line.Words.Count > 0
                            ? line.Words.Average(w => Convert.ToDecimal(w.Confidence))
                            : MediumFieldConfidence;
                        allLines.Add(new OcrReadLine(normalizedLineText, lineConfidence, centerX, centerY));
                        rawTextBuilder.AppendLine(lineText);
                    }
                }
            }

            string rawText = rawTextBuilder.ToString();

            // Parse prescription values
            PrescriptionParseResult parseResult = ParsePrescriptionValues(allLines, cancellationToken);

            OcrConfidenceLevel confidenceLevel = DetermineConfidenceLevel(parseResult);

            return new PrescriptionOcrResultDto
            {
                ImageUrl = string.Empty, // Will be set by command handler
                PublicId = string.Empty, // Will be set by command handler
                RawText = rawText,
                RightEye = parseResult.RightEye,
                LeftEye = parseResult.LeftEye,
                ConfidenceLevel = confidenceLevel,
                OverallConfidence = parseResult.OverallConfidence,
                ParsedSuccessfully = parseResult.ParsedSuccessfully,
                Warnings = parseResult.Warnings
            };
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error calling Azure Vision Read API for URL: {ImageUrl}", imageUrl);
            throw;
        }
    }

    private sealed class PrescriptionParseResult
    {
        public ExtractedPrescriptionValueDto? RightEye { get; set; }
        public ExtractedPrescriptionValueDto? LeftEye { get; set; }
        public decimal OverallConfidence { get; set; }
        public bool ParsedSuccessfully { get; set; }
        public List<string> Warnings { get; set; } = [];
    }

    private sealed record OcrReadLine(string Text, decimal Confidence, decimal CenterX, decimal CenterY);

    private PrescriptionParseResult ParsePrescriptionValues(List<OcrReadLine> lines, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();

        PrescriptionParseResult result = new PrescriptionParseResult
        {
            RightEye = null,
            LeftEye = null,
            Warnings = []
        };

        if (lines.Count == 0)
        {
            result.Warnings.Add("No text detected in image");
            result.ParsedSuccessfully = false;
            return result;
        }

        (ExtractedPrescriptionValueDto? RightEye, ExtractedPrescriptionValueDto? LeftEye) layoutEyes =
            ExtractEyesFromLayoutRows(lines, cancellationToken);

        if (HasAnyValue(layoutEyes.RightEye))
            result.RightEye = layoutEyes.RightEye;

        if (HasAnyValue(layoutEyes.LeftEye))
            result.LeftEye = layoutEyes.LeftEye;

        List<OcrReadLine> rightLines = lines
            .Where(l => RightEyeLabelRegex.IsMatch(l.Text))
            .ToList();

        List<OcrReadLine> leftLines = lines
            .Where(l => LeftEyeLabelRegex.IsMatch(l.Text))
            .ToList();

        // Extract values for right eye (OD)
        if (rightLines.Count > 0 && !HasAnyValue(result.RightEye))
        {
            result.RightEye = ExtractEyeValues(rightLines, EyeType.Right, cancellationToken);
        }

        // Extract values for left eye (OS)
        if (leftLines.Count > 0 && !HasAnyValue(result.LeftEye))
        {
            result.LeftEye = ExtractEyeValues(leftLines, EyeType.Left, cancellationToken);
        }

        bool hasRightLabel = rightLines.Count > 0;
        bool hasLeftLabel = leftLines.Count > 0;

        if (hasRightLabel && !hasLeftLabel)
        {
            result.Warnings.Add("Detected right-eye label but could not find left-eye label.");
        }

        if (!hasRightLabel && hasLeftLabel)
        {
            result.Warnings.Add("Detected left-eye label but could not find right-eye label.");
        }

        // If no eye labels found, try to parse by numeric row layout.
        if (!hasRightLabel && !hasLeftLabel)
        {
            result.Warnings.Add("Could not identify eye labels (OD/OS or R/L)");

            List<ExtractedPrescriptionValueDto> inferredEyes = ExtractEyesFromNumericRows(lines, cancellationToken);
            if (inferredEyes.Count > 0 && !HasAnyValue(result.RightEye))
            {
                result.RightEye = inferredEyes[0];
            }

            if (inferredEyes.Count > 1 && !HasAnyValue(result.LeftEye))
            {
                result.LeftEye = inferredEyes[1];
            }

            if (inferredEyes.Count == 0 && !HasAnyValue(result.RightEye))
            {
                // Last fallback: parse any detected values from full text into right eye.
                result.RightEye = ExtractEyeValues(lines, EyeType.Unknown, cancellationToken);
            }
        }

        if (!HasAnyValue(result.RightEye) || !HasAnyValue(result.LeftEye))
        {
            (ExtractedPrescriptionValueDto? RightEye, ExtractedPrescriptionValueDto? LeftEye) segmentEyes =
                ExtractEyesFromMergedText(lines, cancellationToken);

            if (!HasAnyValue(result.RightEye) && HasAnyValue(segmentEyes.RightEye))
                result.RightEye = segmentEyes.RightEye;

            if (!HasAnyValue(result.LeftEye) && HasAnyValue(segmentEyes.LeftEye))
                result.LeftEye = segmentEyes.LeftEye;
        }

        ValidateEyeValues(result.RightEye, "Right", result.Warnings);
        ValidateEyeValues(result.LeftEye, "Left", result.Warnings);

        // Calculate overall confidence
        List<decimal> confidences = [];

        if (HasAnyValue(result.RightEye) && result.RightEye != null)
            confidences.Add(result.RightEye.OverallConfidence);

        if (HasAnyValue(result.LeftEye) && result.LeftEye != null)
            confidences.Add(result.LeftEye.OverallConfidence);

        result.OverallConfidence = confidences.Any() ? confidences.Average() : 0;
        result.ParsedSuccessfully = result.OverallConfidence >= MediumOverallConfidenceThreshold;

        return result;
    }

    private ExtractedPrescriptionValueDto ExtractEyeValues(
        List<OcrReadLine> lines,
        EyeType eyeType,
        CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();

        List<OcrReadLine> scopedLines = GetEyeScopedLines(lines, eyeType);

        ExtractedPrescriptionValueDto eyeData = new ExtractedPrescriptionValueDto();

        OcrFieldDto? sphField = FindBestField(scopedLines, SphRegex, cancellationToken, "SPH", "SPHERE");
        if (sphField != null)
            eyeData.SPH = sphField;

        OcrFieldDto? cylField = FindBestField(scopedLines, CylRegex, cancellationToken, "CYL", "CYLINDER");
        if (cylField != null)
            eyeData.CYL = cylField;

        OcrFieldDto? axisField = FindBestField(scopedLines, AxisRegex, cancellationToken, "AXIS", "AX");
        if (axisField == null)
        {
            // If AXIS not found inline, try vertical format: AXIS label on separate line
            axisField = FindVerticalValue(scopedLines, AxisRegex, "AXIS", "AX", cancellationToken);
        }
        if (axisField != null)
            eyeData.AXIS = axisField;

        OcrFieldDto? pdField = FindBestField(scopedLines, PdRegex, cancellationToken, "PD", "P.D");
        if (pdField == null)
        {
            // If PD not found inline, try vertical format: PD label on separate line
            pdField = FindVerticalValue(scopedLines, PdRegex, "PD", "P.D", cancellationToken);
        }
        if (pdField != null)
            eyeData.PD = pdField;

        OcrFieldDto? addField = FindBestField(scopedLines, AddRegex, cancellationToken, "ADD", "ADDITION");
        if (addField != null)
            eyeData.ADD = addField;

        // Calculate overall confidence for this eye
        eyeData.OverallConfidence = ComputeWeightedConfidence(eyeData);

        return eyeData;
    }

    private static OcrFieldDto? FindBestField(
        List<OcrReadLine> lines,
        Regex pattern,
        CancellationToken cancellationToken,
        params string[] boostKeywords)
    {
        string? bestValue = null;
        decimal bestConfidence = 0m;

        foreach (OcrReadLine line in lines)
        {
            cancellationToken.ThrowIfCancellationRequested();

            // Skip lines that are eye labels (they contain no prescription values)
            if (RightEyeLabelRegex.IsMatch(line.Text) || LeftEyeLabelRegex.IsMatch(line.Text))
                continue;

            string normalizedLineText = NormalizeText(line.Text);
            MatchCollection matches = pattern.Matches(normalizedLineText);
            foreach (Match match in matches)
            {
                if (!match.Success || match.Groups.Count < 2)
                    continue;

                string normalizedValue = NormalizeNumericToken(match.Groups[1].Value);
                decimal lineConfidence = Math.Clamp(line.Confidence + GetLabelBonus(normalizedLineText, boostKeywords), 0m, 1m);

                if (bestValue == null || lineConfidence > bestConfidence)
                {
                    bestValue = normalizedValue;
                    bestConfidence = lineConfidence;
                }
            }
        }

        if (bestValue == null)
            return null;

        return new OcrFieldDto
        {
            Value = bestValue,
            Confidence = bestConfidence,
            IsExtracted = true
        };
    }

    /// <summary>
    /// Find field value in vertical list format: label on one line, value on next line.
    /// Example: "AXIS" on line N, "100" on line N+1
    /// </summary>
    private static OcrFieldDto? FindVerticalValue(
        List<OcrReadLine> lines,
        Regex labelPattern,
        CancellationToken cancellationToken,
        params string[] labelKeywords)
    {
        for (int i = 0; i < lines.Count - 1; i++)
        {
            cancellationToken.ThrowIfCancellationRequested();

            string currentLine = NormalizeText(lines[i].Text);

            // Check if current line contains the label keyword
            bool hasLabel = labelKeywords.Any(keyword => 
                currentLine.Contains(keyword, StringComparison.OrdinalIgnoreCase));

            if (hasLabel)
            {
                // Try to get value from next line(s)
                for (int j = i + 1; j < Math.Min(i + 3, lines.Count); j++)
                {
                    string nextLine = NormalizeText(lines[j].Text);

                    // Skip lines that are labels
                    if (RightEyeLabelRegex.IsMatch(nextLine) || 
                        LeftEyeLabelRegex.IsMatch(nextLine) ||
                        labelKeywords.Any(kw => nextLine.Contains(kw, StringComparison.OrdinalIgnoreCase)))
                        continue;

                    // Try to extract value using pattern
                    string normalizedValue = NormalizeNumericToken(nextLine);
                    
                    // Check if it's a valid numeric value
                    if (IsValidNumericValue(normalizedValue))
                    {
                        decimal confidence = Math.Clamp((lines[i].Confidence + lines[j].Confidence) / 2, 0m, 1m);
                        return new OcrFieldDto
                        {
                            Value = normalizedValue,
                            Confidence = confidence,
                            IsExtracted = true
                        };
                    }
                }
            }
        }

        return null;
    }

    private static decimal GetLabelBonus(string normalizedLineText, IEnumerable<string> keywords)
    {
        decimal bonus = 0m;
        foreach (string keyword in keywords)
        {
            if (normalizedLineText.Contains(keyword, StringComparison.OrdinalIgnoreCase))
            {
                bonus += 0.05m;
            }
        }

        return bonus;
    }

    private static List<OcrReadLine> GetEyeScopedLines(List<OcrReadLine> lines, EyeType eyeType)
    {
        if (eyeType == EyeType.Unknown)
            return lines;

        bool hasRightLabels = lines.Any(l => RightEyeLabelRegex.IsMatch(l.Text));
        bool hasLeftLabels = lines.Any(l => LeftEyeLabelRegex.IsMatch(l.Text));
        if (!hasRightLabels && !hasLeftLabels)
            return lines;

        if (eyeType == EyeType.Right)
        {
            int rightLabelIndex = lines.FindIndex(l => RightEyeLabelRegex.IsMatch(l.Text));
            if (rightLabelIndex >= 0)
            {
                // Include label + next 10 lines to ensure we capture all values
                return lines
                    .Skip(rightLabelIndex)
                    .Take(11)
                    .ToList();
            }
            return lines;
        }

        if (eyeType == EyeType.Left)
        {
            int leftLabelIndex = lines.FindIndex(l => LeftEyeLabelRegex.IsMatch(l.Text));
            if (leftLabelIndex >= 0)
            {
                // Include label + next 10 lines to ensure we capture all values
                return lines
                    .Skip(leftLabelIndex)
                    .Take(11)
                    .ToList();
            }
            return lines;
        }

        return lines;
    }

    private (ExtractedPrescriptionValueDto? RightEye, ExtractedPrescriptionValueDto? LeftEye)
        ExtractEyesFromLayoutRows(List<OcrReadLine> lines, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();

        List<OcrReadLine> sortedLines = lines
            .OrderBy(l => l.CenterY)
            .ThenBy(l => l.CenterX)
            .ToList();

        List<List<OcrReadLine>> rows = GroupLinesByY(sortedLines);

        ExtractedPrescriptionValueDto? rightEye = null;
        ExtractedPrescriptionValueDto? leftEye = null;

        foreach (List<OcrReadLine> row in rows)
        {
            cancellationToken.ThrowIfCancellationRequested();
            List<OcrReadLine> orderedRow = row.OrderBy(l => l.CenterX).ToList();
            string rowText = string.Join(" ", orderedRow.Select(l => l.Text));

            if (RightEyeLabelRegex.IsMatch(rowText) && rightEye == null)
            {
                rightEye = ParseEyeFromRow(orderedRow, EyeType.Right, cancellationToken);
            }

            if (LeftEyeLabelRegex.IsMatch(rowText) && leftEye == null)
            {
                leftEye = ParseEyeFromRow(orderedRow, EyeType.Left, cancellationToken);
            }
        }

        return (rightEye, leftEye);
    }

    private List<List<OcrReadLine>> GroupLinesByY(List<OcrReadLine> sortedLines)
    {
        decimal rowTolerance = _settings.RowTolerance;
        decimal safeTolerance = rowTolerance <= 0m ? 1m : rowTolerance;
        Dictionary<int, List<OcrReadLine>> buckets = [];

        foreach (OcrReadLine line in sortedLines)
        {
            int bucketKey = Convert.ToInt32(Math.Round(line.CenterY / safeTolerance, MidpointRounding.AwayFromZero));

            if (!buckets.TryGetValue(bucketKey, out List<OcrReadLine>? bucketLines))
            {
                bucketLines = [];
                buckets[bucketKey] = bucketLines;
            }

            bucketLines.Add(line);
        }

        List<List<OcrReadLine>> rows = buckets
            .OrderBy(kvp => kvp.Key)
            .Select(kvp => kvp.Value.OrderBy(l => l.CenterX).ToList())
            .ToList();

        return rows;
    }

    private ExtractedPrescriptionValueDto ParseEyeFromRow(
        List<OcrReadLine> rowLines,
        EyeType eyeType,
        CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();

        string rowText = string.Join(" ", rowLines.Select(l => l.Text));
        ExtractedPrescriptionValueDto eye = new ExtractedPrescriptionValueDto();

        List<Match> tokenMatches = NumericTokenRegex.Matches(rowText).Cast<Match>().ToList();
        if (tokenMatches.Count == 0)
            return ExtractEyeValues(rowLines, eyeType, cancellationToken);

        decimal rowConfidence = rowLines.Average(l => l.Confidence);

        List<string> normalizedTokens = tokenMatches
            .Select(m => NormalizeNumericToken(m.Value))
            .Where(IsValidNumericValue)
            .ToList();

        List<string> decimalTokens = normalizedTokens
            .Where(t => decimal.TryParse(t, out _))
            .Where(t => t.Contains('.')).ToList();

        if (decimalTokens.Count >= 2)
        {
            eye.SPH = new OcrFieldDto
            {
                Value = decimalTokens[0],
                Confidence = Math.Clamp(rowConfidence, 0m, 1m),
                IsExtracted = true
            };

            eye.CYL = new OcrFieldDto
            {
                Value = decimalTokens[1],
                Confidence = Math.Clamp(rowConfidence, 0m, 1m),
                IsExtracted = true
            };
        }

        string? axisToken = normalizedTokens.FirstOrDefault(t =>
            !t.Contains('.') && int.TryParse(t, out int axis) && axis >= 1 && axis <= 180);

        if (axisToken != null)
        {
            eye.AXIS = new OcrFieldDto
            {
                Value = axisToken,
                Confidence = Math.Clamp(rowConfidence, 0m, 1m),
                IsExtracted = true
            };
        }

        ExtractedPrescriptionValueDto labeledEye = ExtractEyeValues(rowLines, eyeType, cancellationToken);
        if (eye.SPH == null && labeledEye.SPH != null) eye.SPH = labeledEye.SPH;
        if (eye.CYL == null && labeledEye.CYL != null) eye.CYL = labeledEye.CYL;
        if (eye.AXIS == null && labeledEye.AXIS != null) eye.AXIS = labeledEye.AXIS;
        if (eye.PD == null && labeledEye.PD != null) eye.PD = labeledEye.PD;
        if (eye.ADD == null && labeledEye.ADD != null) eye.ADD = labeledEye.ADD;

        eye.OverallConfidence = ComputeWeightedConfidence(eye);
        return eye;
    }

    private (ExtractedPrescriptionValueDto? RightEye, ExtractedPrescriptionValueDto? LeftEye)
        ExtractEyesFromMergedText(List<OcrReadLine> lines, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();

        string mergedText = string.Join(" ", lines.Select(l => l.Text));
        decimal averageConfidence = lines.Count > 0 ? lines.Average(l => l.Confidence) : MediumFieldConfidence;

        Match rightMatch = RightEyeSegmentRegex.Match(mergedText);
        Match leftMatch = LeftEyeSegmentRegex.Match(mergedText);

        ExtractedPrescriptionValueDto? rightEye = null;
        ExtractedPrescriptionValueDto? leftEye = null;

        if (rightMatch.Success)
        {
            string rightText = rightMatch.Groups["values"].Value;
            rightEye = ExtractEyeValues([new OcrReadLine(rightText, averageConfidence, 0m, 0m)], EyeType.Right, cancellationToken);
        }

        if (leftMatch.Success)
        {
            string leftText = leftMatch.Groups["values"].Value;
            leftEye = ExtractEyeValues([new OcrReadLine(leftText, averageConfidence, 0m, 0m)], EyeType.Left, cancellationToken);
        }

        return (rightEye, leftEye);
    }

    private static List<ExtractedPrescriptionValueDto> ExtractEyesFromNumericRows(
        List<OcrReadLine> lines,
        CancellationToken cancellationToken)
    {
        List<ExtractedPrescriptionValueDto> eyes = [];

        foreach (OcrReadLine line in lines)
        {
            cancellationToken.ThrowIfCancellationRequested();

            Match rowMatch = NumericRowRegex.Match(line.Text);
            if (!rowMatch.Success)
                continue;

            ExtractedPrescriptionValueDto eye = new ExtractedPrescriptionValueDto
            {
                SPH = new OcrFieldDto
                {
                    Value = rowMatch.Groups[1].Value,
                    Confidence = Math.Clamp(line.Confidence, 0m, 1m),
                    IsExtracted = true
                },
                CYL = new OcrFieldDto
                {
                    Value = rowMatch.Groups[2].Value,
                    Confidence = Math.Clamp(line.Confidence, 0m, 1m),
                    IsExtracted = true
                }
            };

            if (rowMatch.Groups[3].Success)
            {
                eye.AXIS = new OcrFieldDto
                {
                    Value = rowMatch.Groups[3].Value,
                    Confidence = Math.Clamp(line.Confidence, 0m, 1m),
                    IsExtracted = true
                };
            }

            eye.OverallConfidence = ComputeWeightedConfidence(eye);

            eyes.Add(eye);
            if (eyes.Count == 2)
                break;
        }

        return eyes;
    }

    private static string NormalizeText(string input)
    {
        string normalized = input
            .Replace("AXLS", "AXIS", StringComparison.OrdinalIgnoreCase)
            .Replace("CYI", "CYL", StringComparison.OrdinalIgnoreCase)
            .Replace("SPN", "SPH", StringComparison.OrdinalIgnoreCase);

        if (!ContainsAmbiguousNumericChars(normalized))
            return normalized;

        normalized = NumericTokenRegex.Replace(normalized, match => NormalizeNumericToken(match.Value));

        return normalized;
    }

    private static string NormalizeNumericToken(string token)
    {
        if (!token.Any(char.IsDigit))
            return token;

        StringBuilder builder = new StringBuilder(token.Length);

        foreach (char ch in token)
        {
            switch (char.ToUpperInvariant(ch))
            {
                case 'O':
                    builder.Append('0');
                    break;
                case 'I':
                case 'L':
                    builder.Append('1');
                    break;
                case 'S':
                    builder.Append('5');
                    break;
                case 'B':
                    builder.Append('8');
                    break;
                default:
                    builder.Append(ch);
                    break;
            }
        }

        return builder.ToString();
    }

    private static bool ContainsAmbiguousNumericChars(string input)
    {
        for (int i = 0; i < input.Length; i++)
        {
            char ch = input[i];
            if (char.IsDigit(ch))
                return true;

            switch (char.ToUpperInvariant(ch))
            {
                case 'O':
                case 'I':
                case 'L':
                case 'S':
                case 'B':
                    return true;
            }
        }

        return false;
    }

    private static decimal ComputeWeightedConfidence(ExtractedPrescriptionValueDto eyeData)
    {
        decimal sphConfidence = eyeData.SPH?.Confidence ?? 0m;
        decimal cylConfidence = eyeData.CYL?.Confidence ?? 0m;
        decimal axisConfidence = eyeData.AXIS?.Confidence ?? 0m;
        decimal addConfidence = eyeData.ADD?.Confidence ?? 0m;

        return
            (sphConfidence * SphWeight) +
            (cylConfidence * CylWeight) +
            (axisConfidence * AxisWeight) +
            (addConfidence * AddWeight);
    }

    private static (decimal CenterX, decimal CenterY) GetLineCenter(IReadOnlyList<ImagePoint> polygon)
    {
        if (polygon.Count == 0)
            return (0m, 0m);

        decimal centerX = polygon.Average(p => Convert.ToDecimal(p.X));
        decimal centerY = polygon.Average(p => Convert.ToDecimal(p.Y));

        return (centerX, centerY);
    }

    private static void ValidateEyeValues(
        ExtractedPrescriptionValueDto? eye,
        string eyeName,
        List<string> warnings)
    {
        if (eye == null)
            return;

        if (eye.SPH?.IsExtracted == true &&
            decimal.TryParse(eye.SPH.Value, out decimal sphValue) &&
            (sphValue < -20m || sphValue > 20m))
        {
            warnings.Add($"{eyeName} eye: Invalid SPH value '{eye.SPH.Value}'.");
        }

        if (eye.SPH?.IsExtracted == true &&
            decimal.TryParse(eye.SPH.Value, out decimal sphStepValue) &&
            !IsQuarterStep(sphStepValue))
        {
            warnings.Add($"{eyeName} eye: SPH value '{eye.SPH.Value}' is not in 0.25 step.");
        }

        if (eye.CYL?.IsExtracted == true &&
            decimal.TryParse(eye.CYL.Value, out decimal cylValue) &&
            (cylValue < -6m || cylValue > 6m))
        {
            warnings.Add($"{eyeName} eye: Invalid CYL value '{eye.CYL.Value}'.");
        }

        if (eye.CYL?.IsExtracted == true &&
            decimal.TryParse(eye.CYL.Value, out decimal cylStepValue) &&
            !IsQuarterStep(cylStepValue))
        {
            warnings.Add($"{eyeName} eye: CYL value '{eye.CYL.Value}' is not in 0.25 step.");
        }

        if (eye.AXIS?.IsExtracted == true &&
            int.TryParse(eye.AXIS.Value, out int axisValue) &&
            (axisValue < 1 || axisValue > 180))
        {
            warnings.Add($"{eyeName} eye: Invalid AXIS value '{eye.AXIS.Value}'.");
        }

        if (eye.PD?.IsExtracted == true && !string.IsNullOrWhiteSpace(eye.PD.Value) && !IsValidPdValue(eye.PD.Value))
        {
            warnings.Add($"{eyeName} eye: Invalid PD value '{eye.PD.Value}'.");
        }
    }

    private static bool HasAnyValue(ExtractedPrescriptionValueDto? eye)
    {
        if (eye == null)
            return false;

        return eye.SPH?.IsExtracted == true ||
               eye.CYL?.IsExtracted == true ||
               eye.AXIS?.IsExtracted == true ||
               eye.PD?.IsExtracted == true ||
               eye.ADD?.IsExtracted == true;
    }

    private static bool IsQuarterStep(decimal value)
    {
        decimal scaled = value * 4m;
        decimal rounded = Math.Round(scaled, 0, MidpointRounding.AwayFromZero);
        decimal delta = Math.Abs(scaled - rounded);
        return delta < 0.0001m;
    }

    private static bool IsValidPdValue(string pdText)
    {
        if (string.IsNullOrWhiteSpace(pdText))
            return false;

        if (pdText.Contains('/'))
        {
            string[] parts = pdText.Split('/', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries);
            if (parts.Length != 2)
                return false;

            bool isLeftValid = decimal.TryParse(parts[0], out decimal leftPd) && leftPd >= 25m && leftPd <= 40m;
            bool isRightValid = decimal.TryParse(parts[1], out decimal rightPd) && rightPd >= 25m && rightPd <= 40m;
            return isLeftValid && isRightValid;
        }

        bool isSingleValid = decimal.TryParse(pdText, out decimal singlePd) && singlePd >= 50m && singlePd <= 75m;
        return isSingleValid;
    }

    private OcrConfidenceLevel DetermineConfidenceLevel(PrescriptionParseResult parseResult)
    {
        decimal confidence = parseResult.OverallConfidence;

        if (confidence >= HighOverallConfidenceThreshold)
            return OcrConfidenceLevel.High;
        
        if (confidence >= MediumOverallConfidenceThreshold)
            return OcrConfidenceLevel.Medium;
        
        return OcrConfidenceLevel.Low;
    }

    /// <summary>
    /// Check if text is a valid numeric value (excluding eye labels like O.D., O.S., OD, OS)
    /// </summary>
    private static bool IsValidNumericValue(string text)
    {
        if (string.IsNullOrWhiteSpace(text))
            return false;

        string upper = text.ToUpperInvariant().Trim();

        // Exclude eye labels and related noise
        if (upper == "OD" || upper == "O.D" || upper == "O.D." ||
            upper == "OS" || upper == "O.S" || upper == "O.S." ||
            upper == "RIGHT" || upper == "LEFT" || upper == "R" || upper == "L")
            return false;

        if (upper.Any(char.IsLetter))
            return false;

        // Accept decimal or integer values
        return decimal.TryParse(text, out _) || int.TryParse(text, out _);
    }

    /// <summary>
    /// Extract numeric values from OCR lines, filtering out noise and labels
    /// </summary>
    private static List<string> ExtractNumericValues(List<OcrReadLine> lines)
    {
        return lines
            .Select(l => NormalizeNumericToken(l.Text))
            .Where(IsValidNumericValue)
            .ToList();
    }
}