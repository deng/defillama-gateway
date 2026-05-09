# defillama_gateway.api.DAppsApi

## Load the API package
```dart
import 'package:defillama_gateway/api.dart';
```

All URIs are relative to *https://defillama.bithub.pro*

Method | HTTP request | Description
------------- | ------------- | -------------
[**listDapps**](DAppsApi.md#listdapps) | **GET** /api/v1/dapps | 按链查询 DApp 列表


# **listDapps**
> DappListResponse listDapps(chain, group, category, limit, offset, fields, sort, excludeSummary, includeTotal, compact)

按链查询 DApp 列表

从 DefiLlama /protocols 拉取数据，按链过滤，并支持 group/category/fields/sort/pagination 等参数。

### Example
```dart
import 'package:defillama_gateway/api.dart';

final api_instance = DAppsApi();
final chain = chain_example; // String | 链名称或常见别名，如 eth/bnb/arb
final group = group_example; // String | DApp 分组过滤
final category = category_example; // String | 按 DefiLlama category 过滤
final limit = 56; // int | 
final offset = 56; // int | 
final fields = fields_example; // String | 逗号分隔字段白名单: id, name, slug, url, logo, category, group, parentProtocol, chains, chainTvl, tvl
final sort = sort_example; // String | 
final excludeSummary = true; // bool | 
final includeTotal = true; // bool | 
final compact = true; // bool | 轻量响应预设，等价于 excludeSummary=true & includeTotal=false

try {
    final result = api_instance.listDapps(chain, group, category, limit, offset, fields, sort, excludeSummary, includeTotal, compact);
    print(result);
} catch (e) {
    print('Exception when calling DAppsApi->listDapps: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **chain** | **String**| 链名称或常见别名，如 eth/bnb/arb | 
 **group** | **String**| DApp 分组过滤 | [optional] 
 **category** | **String**| 按 DefiLlama category 过滤 | [optional] 
 **limit** | **int**|  | [optional] 
 **offset** | **int**|  | [optional] 
 **fields** | **String**| 逗号分隔字段白名单: id, name, slug, url, logo, category, group, parentProtocol, chains, chainTvl, tvl | [optional] 
 **sort** | **String**|  | [optional] 
 **excludeSummary** | **bool**|  | [optional] 
 **includeTotal** | **bool**|  | [optional] 
 **compact** | **bool**| 轻量响应预设，等价于 excludeSummary=true & includeTotal=false | [optional] 

### Return type

[**DappListResponse**](DappListResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

