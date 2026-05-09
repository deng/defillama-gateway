# defillama_gateway.api.SystemApi

## Load the API package
```dart
import 'package:defillama_gateway/api.dart';
```

All URIs are relative to *https://defillama.bithub.pro*

Method | HTTP request | Description
------------- | ------------- | -------------
[**getHealth**](SystemApi.md#gethealth) | **GET** /health | 健康检查


# **getHealth**
> HealthResponse getHealth()

健康检查

### Example
```dart
import 'package:defillama_gateway/api.dart';

final api_instance = SystemApi();

try {
    final result = api_instance.getHealth();
    print(result);
} catch (e) {
    print('Exception when calling SystemApi->getHealth: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**HealthResponse**](HealthResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

