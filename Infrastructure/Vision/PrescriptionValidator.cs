using Application.Prescriptions.DTOs;

namespace Infrastructure.Vision;

internal static class PrescriptionValidator
{
    internal const decimal SphWeight = 0.37m;
    internal const decimal CylWeight = 0.27m;
    internal const decimal AxisWeight = 0.18m;
    internal const decimal AddWeight = 0.08m;
    internal const decimal PdWeight = 0.10m;

    public static void ValidateEyeValues(
        ExtractedPrescriptionValueDto? eye,
        string eyeName,
        List<string> warnings)
    {
        if (eye == null)
            return;

        if (eye.SPH?.IsExtracted == true &&
            decimal.TryParse(eye.SPH.Value, out decimal sphValue))
        {
            if (sphValue < -20m || sphValue > 20m)
            {
                eye.SPH.Confidence = 0m;
                warnings.Add($"{eyeName} eye: Invalid SPH value '{eye.SPH.Value}'.");
            }
            else if (!IsQuarterStep(sphValue))
            {
                eye.SPH.Confidence = 0m;
                warnings.Add($"{eyeName} eye: SPH value '{eye.SPH.Value}' is not in 0.25 step.");
            }
        }

        if (eye.CYL?.IsExtracted == true &&
            decimal.TryParse(eye.CYL.Value, out decimal cylValue))
        {
            if (cylValue < -6m || cylValue > 0m)
            {
                eye.CYL.Confidence = 0m;
                // Domain rule: CYL must be in [-6, 0]. Positive values are not used in this system
                // and would be rejected at checkout/order validation — flag early.
                warnings.Add($"{eyeName} eye: CYL value '{eye.CYL.Value}' is outside the valid domain range [-6, 0].");
            }
            else if (!IsQuarterStep(cylValue))
            {
                eye.CYL.Confidence = 0m;
                warnings.Add($"{eyeName} eye: CYL value '{eye.CYL.Value}' is not in 0.25 step.");
            }
        }

        if (eye.AXIS?.IsExtracted == true &&
            int.TryParse(eye.AXIS.Value, out int axisValue) &&
            (axisValue < 1 || axisValue > 180))
        {
            eye.AXIS.Confidence = 0m;
            warnings.Add($"{eyeName} eye: Invalid AXIS value '{eye.AXIS.Value}'.");
        }

        if (eye.PD?.IsExtracted == true && !string.IsNullOrWhiteSpace(eye.PD.Value) && !IsValidPdValue(eye.PD.Value))
        {
            eye.PD.Confidence = 0m;
            warnings.Add($"{eyeName} eye: Invalid PD value '{eye.PD.Value}'.");
        }
    }

    public static void ValidateGlobalPd(OcrFieldDto? pd, List<string> warnings)
    {
        if (pd?.IsExtracted == true && !string.IsNullOrWhiteSpace(pd.Value) && !IsValidPdValue(pd.Value))
        {
            pd.Confidence = 0m;
            warnings.Add($"Binocular: Invalid PD value '{pd.Value}'.");
        }
    }

    public static void RecalculateEyeConfidence(ExtractedPrescriptionValueDto? eye)
    {
        if (eye == null) return;

        decimal sphConfidence = eye.SPH?.Confidence ?? 0m;
        decimal cylConfidence = eye.CYL?.Confidence ?? 0m;
        decimal axisConfidence = eye.AXIS?.Confidence ?? 0m;
        decimal addConfidence = eye.ADD?.Confidence ?? 0m;
        decimal pdConfidence = eye.PD?.Confidence ?? 0m;

        eye.OverallConfidence = 
            (sphConfidence * SphWeight) +
            (cylConfidence * CylWeight) +
            (axisConfidence * AxisWeight) +
            (addConfidence * AddWeight) +
            (pdConfidence * PdWeight);
    }

    private static bool IsQuarterStep(decimal value)
    {
        decimal scaled = value * 4m;
        decimal rounded = Math.Round(scaled, 0, MidpointRounding.AwayFromZero);
        decimal delta = Math.Abs(scaled - rounded);
        return delta < 0.0001m;
    }

    public static bool IsValidPdValue(string pdText)
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
}
