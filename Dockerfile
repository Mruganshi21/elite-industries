# Render (and any container host) builds the site from this file.
#
# Two stages so the shipped image carries the ASP.NET runtime only, not the
# ~800 MB SDK: stage one compiles, stage two takes just the publish output.

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# The csproj alone first, so `dotnet restore` is cached and only re-runs when a
# dependency actually changes — not on every edit to a view or a stylesheet.
COPY EliteIndustries.csproj ./
RUN dotnet restore

COPY . .
RUN dotnet publish -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish ./

ENV ASPNETCORE_ENVIRONMENT=Production

# Render hands the port in at runtime via $PORT (10000 unless changed), so the
# bind address cannot be baked in as an ENV — it has to be expanded by a shell
# at start-up. 10000 is the fallback for `docker run` off Render.
EXPOSE 10000
ENTRYPOINT ["/bin/sh", "-c", "export ASPNETCORE_URLS=http://+:${PORT:-10000}; exec dotnet EliteIndustries.dll"]
