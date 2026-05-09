//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class DappListResponseData {
  /// Returns a new [DappListResponseData] instance.
  DappListResponseData({
    required this.chain,
    required this.requestedChain,
    this.total,
    required this.pagination,
    this.summary,
    this.protocols = const [],
  });

  String chain;

  String requestedChain;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  int? total;

  Pagination pagination;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  Summary? summary;

  List<DappResource> protocols;

  @override
  bool operator ==(Object other) => identical(this, other) || other is DappListResponseData &&
    other.chain == chain &&
    other.requestedChain == requestedChain &&
    other.total == total &&
    other.pagination == pagination &&
    other.summary == summary &&
    _deepEquality.equals(other.protocols, protocols);

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (chain.hashCode) +
    (requestedChain.hashCode) +
    (total == null ? 0 : total!.hashCode) +
    (pagination.hashCode) +
    (summary == null ? 0 : summary!.hashCode) +
    (protocols.hashCode);

  @override
  String toString() => 'DappListResponseData[chain=$chain, requestedChain=$requestedChain, total=$total, pagination=$pagination, summary=$summary, protocols=$protocols]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'chain'] = this.chain;
      json[r'requestedChain'] = this.requestedChain;
    if (this.total != null) {
      json[r'total'] = this.total;
    } else {
      json[r'total'] = null;
    }
      json[r'pagination'] = this.pagination;
    if (this.summary != null) {
      json[r'summary'] = this.summary;
    } else {
      json[r'summary'] = null;
    }
      json[r'protocols'] = this.protocols;
    return json;
  }

  /// Returns a new [DappListResponseData] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static DappListResponseData? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        requiredKeys.forEach((key) {
          assert(json.containsKey(key), 'Required key "DappListResponseData[$key]" is missing from JSON.');
          assert(json[key] != null, 'Required key "DappListResponseData[$key]" has a null value in JSON.');
        });
        return true;
      }());

      return DappListResponseData(
        chain: mapValueOfType<String>(json, r'chain')!,
        requestedChain: mapValueOfType<String>(json, r'requestedChain')!,
        total: mapValueOfType<int>(json, r'total'),
        pagination: Pagination.fromJson(json[r'pagination'])!,
        summary: Summary.fromJson(json[r'summary']),
        protocols: DappResource.listFromJson(json[r'protocols']),
      );
    }
    return null;
  }

  static List<DappListResponseData> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <DappListResponseData>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = DappListResponseData.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, DappListResponseData> mapFromJson(dynamic json) {
    final map = <String, DappListResponseData>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = DappListResponseData.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of DappListResponseData-objects as value to a dart map
  static Map<String, List<DappListResponseData>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<DappListResponseData>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = DappListResponseData.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'chain',
    'requestedChain',
    'pagination',
    'protocols',
  };
}

