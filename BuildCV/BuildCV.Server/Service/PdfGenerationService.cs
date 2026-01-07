using BuildCV.Server.Services;
using Microsoft.Playwright;
using System.Xml;
using static BuildCV.Server.Models.CVData;

namespace BuildCV.Server.Service
{
    public class PdfGenerationService : IPdfGenerationService
    {
        private readonly ILogger<PdfGenerationService> _logger;
        private static bool _playwrightInstalled = false;
        private static readonly SemaphoreSlim _initLock = new SemaphoreSlim(1, 1);

        public PdfGenerationService(ILogger<PdfGenerationService> logger)
        {
            _logger = logger;
        }

        private async Task EnsurePlaywrightInstalled()
        {
            if (_playwrightInstalled) return;

            await _initLock.WaitAsync();
            try
            {
                if (_playwrightInstalled) return;

                _logger.LogInformation("Installing Playwright browsers...");

                // Install Playwright browsers if not already installed
                var exitCode = Microsoft.Playwright.Program.Main(new[] { "install", "chromium" });

                if (exitCode != 0)
                {
                    _logger.LogWarning("Playwright install returned code {ExitCode}, continuing anyway", exitCode);
                }

                _playwrightInstalled = true;
                _logger.LogInformation("Playwright browsers ready");
            }
            finally
            {
                _initLock.Release();
            }
        }

        public async Task<byte[]> GeneratePdfFromHtml(string htmlContent, PdfGenerationOptions options)
        {
            await EnsurePlaywrightInstalled();

            try
            {
                _logger.LogInformation("Starting PDF generation with Playwright");

                using var playwright = await Playwright.CreateAsync();

                await using var browser = await playwright.Chromium.LaunchAsync(new BrowserTypeLaunchOptions
                {
                    Headless = true,
                });

                var page = await browser.NewPageAsync(new BrowserNewPageOptions
                {
                    ViewportSize = new ViewportSize { Width = 794, Height = 1123 } // A4 in pixels at 96 DPI
                });

                // Set content with proper base URL for fonts and styles
                await page.SetContentAsync(htmlContent, new PageSetContentOptions
                {
                    WaitUntil = WaitUntilState.NetworkIdle,
                    Timeout = 30000
                });

                // Wait for fonts to load
                await page.WaitForLoadStateAsync(LoadState.NetworkIdle);
                await Task.Delay(500); // Additional buffer for font rendering

                // Generate PDF
                var pdfBytes = await page.PdfAsync(new PagePdfOptions
                {
                    Format = options.Format,
                    PrintBackground = options.PrintBackground,
                    Scale = (float?)options.Scale,
                    Margin = new Margin
                    {
                        Top = options.Margin.Top,
                        Right = options.Margin.Right,
                        Bottom = options.Margin.Bottom,
                        Left = options.Margin.Left
                    },
                    PreferCSSPageSize = false
                });

                _logger.LogInformation("PDF generated successfully, size: {Size} bytes", pdfBytes.Length);

                return pdfBytes;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating PDF with Playwright");
                throw new Exception($"PDF generation failed: {ex.Message}", ex);
            }
        }
    }
}
