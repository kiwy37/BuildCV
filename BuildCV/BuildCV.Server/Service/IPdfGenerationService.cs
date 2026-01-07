using static BuildCV.Server.Models.CVData;

namespace BuildCV.Server.Services
{
    public interface IPdfGenerationService
    {
        Task<byte[]> GeneratePdfFromHtml(string htmlContent, PdfGenerationOptions options);
    }
}
