FROM bitnami/dotnet-sdk:3.1
WORKDIR /app

COPY *.csproj ./
RUN dotnet restore

COPY Controllers Properties *.json *.cs ./

EXPOSE 3232
ENTRYPOINT ["dotnet", "run", "--urls", "http://*:3232"]
