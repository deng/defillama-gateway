//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;


class DAppsApi {
  DAppsApi([ApiClient? apiClient]) : apiClient = apiClient ?? defaultApiClient;

  final ApiClient apiClient;

  /// 按链查询 DApp 列表
  ///
  /// 从 DefiLlama /protocols 拉取数据，按链过滤，并支持 group/category/fields/sort/pagination 等参数。
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [String] chain (required):
  ///   链名称或常见别名，如 eth/bnb/arb
  ///
  /// * [String] group:
  ///   DApp 分组过滤
  ///
  /// * [String] category:
  ///   按 DefiLlama category 过滤
  ///
  /// * [int] limit:
  ///
  /// * [int] offset:
  ///
  /// * [String] fields:
  ///   逗号分隔字段白名单: id, name, slug, url, logo, category, group, parentProtocol, chains, chainTvl, tvl
  ///
  /// * [String] sort:
  ///
  /// * [bool] excludeSummary:
  ///
  /// * [bool] includeTotal:
  ///
  /// * [bool] compact:
  ///   轻量响应预设，等价于 excludeSummary=true & includeTotal=false
  Future<Response> listDappsWithHttpInfo(String chain, { String? group, String? category, int? limit, int? offset, String? fields, String? sort, bool? excludeSummary, bool? includeTotal, bool? compact, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/dapps';

    // ignore: prefer_final_locals
    Object? postBody;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

      queryParams.addAll(_queryParams('', 'chain', chain));
    if (group != null) {
      queryParams.addAll(_queryParams('', 'group', group));
    }
    if (category != null) {
      queryParams.addAll(_queryParams('', 'category', category));
    }
    if (limit != null) {
      queryParams.addAll(_queryParams('', 'limit', limit));
    }
    if (offset != null) {
      queryParams.addAll(_queryParams('', 'offset', offset));
    }
    if (fields != null) {
      queryParams.addAll(_queryParams('', 'fields', fields));
    }
    if (sort != null) {
      queryParams.addAll(_queryParams('', 'sort', sort));
    }
    if (excludeSummary != null) {
      queryParams.addAll(_queryParams('', 'excludeSummary', excludeSummary));
    }
    if (includeTotal != null) {
      queryParams.addAll(_queryParams('', 'includeTotal', includeTotal));
    }
    if (compact != null) {
      queryParams.addAll(_queryParams('', 'compact', compact));
    }

    const contentTypes = <String>[];


    return apiClient.invokeAPI(
      path,
      'GET',
      queryParams,
      postBody,
      headerParams,
      formParams,
      contentTypes.isEmpty ? null : contentTypes.first,
    );
  }

  /// 按链查询 DApp 列表
  ///
  /// 从 DefiLlama /protocols 拉取数据，按链过滤，并支持 group/category/fields/sort/pagination 等参数。
  ///
  /// Parameters:
  ///
  /// * [String] chain (required):
  ///   链名称或常见别名，如 eth/bnb/arb
  ///
  /// * [String] group:
  ///   DApp 分组过滤
  ///
  /// * [String] category:
  ///   按 DefiLlama category 过滤
  ///
  /// * [int] limit:
  ///
  /// * [int] offset:
  ///
  /// * [String] fields:
  ///   逗号分隔字段白名单: id, name, slug, url, logo, category, group, parentProtocol, chains, chainTvl, tvl
  ///
  /// * [String] sort:
  ///
  /// * [bool] excludeSummary:
  ///
  /// * [bool] includeTotal:
  ///
  /// * [bool] compact:
  ///   轻量响应预设，等价于 excludeSummary=true & includeTotal=false
  Future<DappListResponse?> listDapps(String chain, { String? group, String? category, int? limit, int? offset, String? fields, String? sort, bool? excludeSummary, bool? includeTotal, bool? compact, }) async {
    final response = await listDappsWithHttpInfo(chain,  group: group, category: category, limit: limit, offset: offset, fields: fields, sort: sort, excludeSummary: excludeSummary, includeTotal: includeTotal, compact: compact, );
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'DappListResponse',) as DappListResponse;
    
    }
    return null;
  }
}
