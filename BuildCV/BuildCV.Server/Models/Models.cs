namespace BuildCV.Server.Models
{
    public class CVData
    {
        public class PdfGenerationOptions
        {
            public string Format { get; set; } = "A4"; // A4, Letter
            public bool PrintBackground { get; set; } = true;
            public double Scale { get; set; } = 1.0; // For high-quality: 1.5 or 2.0
            public MarginOptions Margin { get; set; } = new MarginOptions();
        }

        public class MarginOptions
        {
            public string Top { get; set; } = "0";
            public string Right { get; set; } = "0";
            public string Bottom { get; set; } = "0";
            public string Left { get; set; } = "0";
        }

        public class PdfGenerationRequest
        {
            public string HtmlContent { get; set; } = string.Empty;
            public PdfGenerationOptions Options { get; set; } = new PdfGenerationOptions();
        }

        public PersonalInfo PersonalInfo { get; set; } = new();
        public string ProfessionalSummary { get; set; } = string.Empty;
        public List<Experience> Experiences { get; set; } = new();
        public List<Education> Education { get; set; } = new();
        public List<string> Skills { get; set; } = new();
        public List<Project> Projects { get; set; } = new();
        public List<Certification> Certifications { get; set; } = new();
        public List<string> Languages { get; set; } = new();
    }

    public class PersonalInfo
    {
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string LinkedIn { get; set; } = string.Empty;
        public string Website { get; set; } = string.Empty;
    }

    public class Experience
    {
        public string JobTitle { get; set; } = string.Empty;
        public string Company { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string StartDate { get; set; } = string.Empty;
        public string EndDate { get; set; } = string.Empty;
        public bool IsCurrent { get; set; }
        public List<string> Responsibilities { get; set; } = new();
    }

    public class Education
    {
        public string Degree { get; set; } = string.Empty;
        public string Institution { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string StartDate { get; set; } = string.Empty;
        public string EndDate { get; set; } = string.Empty;
        public string GPA { get; set; } = string.Empty;
        public List<string> Achievements { get; set; } = new();
    }

    public class Project
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Link { get; set; } = string.Empty;
        public List<string> Technologies { get; set; } = new();
    }

    public class Certification
    {
        public string Name { get; set; } = string.Empty;
        public string Issuer { get; set; } = string.Empty;
        public string Date { get; set; } = string.Empty;
        public string CredentialId { get; set; } = string.Empty;
    }

    public class CVPreviewResponse
    {
        public string HtmlContent { get; set; } = string.Empty;
        public string TemplateId { get; set; } = string.Empty;
    }

    public class CVExportRequest
    {
        public CVData CVData { get; set; } = new();
        public string TemplateId { get; set; } = string.Empty;
    }

    public class CVTemplate
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string PreviewImage { get; set; } = string.Empty;
    }

    public class ValidationResult
    {
        public bool IsValid { get; set; }
        public List<string> Errors { get; set; } = new();
        public List<string> Warnings { get; set; } = new();
    }
}