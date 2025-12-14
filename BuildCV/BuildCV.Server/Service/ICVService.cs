using BuildCV.Server.Models;

namespace BuildCV.Server.Services
{
    public interface ICVService
    {
        CVPreviewResponse GeneratePreview(CVData cvData);
        byte[] ExportToPdf(CVData cvData, string templateId);
        List<CVTemplate> GetAvailableTemplates();
        ValidationResult ValidateCV(CVData cvData);
    }
}