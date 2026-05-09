//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class HealthResponse {
  /// Returns a new [HealthResponse] instance.
  HealthResponse({
    required this.status,
    required this.service,
    required this.timestamp,
    required this.version,
  });

  String status;

  String service;

  String timestamp;

  String version;

  @override
  bool operator ==(Object other) => identical(this, other) || other is HealthResponse &&
    other.status == status &&
    other.service == service &&
    other.timestamp == timestamp &&
    other.version == version;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (status.hashCode) +
    (service.hashCode) +
    (timestamp.hashCode) +
    (version.hashCode);

  @override
  String toString() => 'HealthResponse[status=$status, service=$service, timestamp=$timestamp, version=$version]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'status'] = this.status;
      json[r'service'] = this.service;
      json[r'timestamp'] = this.timestamp;
      json[r'version'] = this.version;
    return json;
  }

  /// Returns a new [HealthResponse] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static HealthResponse? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        requiredKeys.forEach((key) {
          assert(json.containsKey(key), 'Required key "HealthResponse[$key]" is missing from JSON.');
          assert(json[key] != null, 'Required key "HealthResponse[$key]" has a null value in JSON.');
        });
        return true;
      }());

      return HealthResponse(
        status: mapValueOfType<String>(json, r'status')!,
        service: mapValueOfType<String>(json, r'service')!,
        timestamp: mapValueOfType<String>(json, r'timestamp')!,
        version: mapValueOfType<String>(json, r'version')!,
      );
    }
    return null;
  }

  static List<HealthResponse> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <HealthResponse>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = HealthResponse.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, HealthResponse> mapFromJson(dynamic json) {
    final map = <String, HealthResponse>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = HealthResponse.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of HealthResponse-objects as value to a dart map
  static Map<String, List<HealthResponse>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<HealthResponse>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = HealthResponse.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'status',
    'service',
    'timestamp',
    'version',
  };
}

