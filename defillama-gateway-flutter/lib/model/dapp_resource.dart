//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class DappResource {
  /// Returns a new [DappResource] instance.
  DappResource({
    this.id,
    this.name,
    this.slug,
    this.url,
    this.logo,
    this.category,
    this.group,
    this.parentProtocol,
    this.chains = const [],
    this.chainTvl,
    this.tvl,
  });

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? id;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? name;

  String? slug;

  String? url;

  String? logo;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? category;

  DappResourceGroupEnum? group;

  String? parentProtocol;

  List<String> chains;

  num? chainTvl;

  num? tvl;

  @override
  bool operator ==(Object other) => identical(this, other) || other is DappResource &&
    other.id == id &&
    other.name == name &&
    other.slug == slug &&
    other.url == url &&
    other.logo == logo &&
    other.category == category &&
    other.group == group &&
    other.parentProtocol == parentProtocol &&
    _deepEquality.equals(other.chains, chains) &&
    other.chainTvl == chainTvl &&
    other.tvl == tvl;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (id == null ? 0 : id!.hashCode) +
    (name == null ? 0 : name!.hashCode) +
    (slug == null ? 0 : slug!.hashCode) +
    (url == null ? 0 : url!.hashCode) +
    (logo == null ? 0 : logo!.hashCode) +
    (category == null ? 0 : category!.hashCode) +
    (group == null ? 0 : group!.hashCode) +
    (parentProtocol == null ? 0 : parentProtocol!.hashCode) +
    (chains.hashCode) +
    (chainTvl == null ? 0 : chainTvl!.hashCode) +
    (tvl == null ? 0 : tvl!.hashCode);

  @override
  String toString() => 'DappResource[id=$id, name=$name, slug=$slug, url=$url, logo=$logo, category=$category, group=$group, parentProtocol=$parentProtocol, chains=$chains, chainTvl=$chainTvl, tvl=$tvl]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
    if (this.id != null) {
      json[r'id'] = this.id;
    } else {
      json[r'id'] = null;
    }
    if (this.name != null) {
      json[r'name'] = this.name;
    } else {
      json[r'name'] = null;
    }
    if (this.slug != null) {
      json[r'slug'] = this.slug;
    } else {
      json[r'slug'] = null;
    }
    if (this.url != null) {
      json[r'url'] = this.url;
    } else {
      json[r'url'] = null;
    }
    if (this.logo != null) {
      json[r'logo'] = this.logo;
    } else {
      json[r'logo'] = null;
    }
    if (this.category != null) {
      json[r'category'] = this.category;
    } else {
      json[r'category'] = null;
    }
    if (this.group != null) {
      json[r'group'] = this.group;
    } else {
      json[r'group'] = null;
    }
    if (this.parentProtocol != null) {
      json[r'parentProtocol'] = this.parentProtocol;
    } else {
      json[r'parentProtocol'] = null;
    }
      json[r'chains'] = this.chains;
    if (this.chainTvl != null) {
      json[r'chainTvl'] = this.chainTvl;
    } else {
      json[r'chainTvl'] = null;
    }
    if (this.tvl != null) {
      json[r'tvl'] = this.tvl;
    } else {
      json[r'tvl'] = null;
    }
    return json;
  }

  /// Returns a new [DappResource] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static DappResource? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        requiredKeys.forEach((key) {
          assert(json.containsKey(key), 'Required key "DappResource[$key]" is missing from JSON.');
          assert(json[key] != null, 'Required key "DappResource[$key]" has a null value in JSON.');
        });
        return true;
      }());

      return DappResource(
        id: mapValueOfType<String>(json, r'id'),
        name: mapValueOfType<String>(json, r'name'),
        slug: mapValueOfType<String>(json, r'slug'),
        url: mapValueOfType<String>(json, r'url'),
        logo: mapValueOfType<String>(json, r'logo'),
        category: mapValueOfType<String>(json, r'category'),
        group: DappResourceGroupEnum.fromJson(json[r'group']),
        parentProtocol: mapValueOfType<String>(json, r'parentProtocol'),
        chains: json[r'chains'] is Iterable
            ? (json[r'chains'] as Iterable).cast<String>().toList(growable: false)
            : const [],
        chainTvl: json[r'chainTvl'] == null
            ? null
            : num.parse('${json[r'chainTvl']}'),
        tvl: json[r'tvl'] == null
            ? null
            : num.parse('${json[r'tvl']}'),
      );
    }
    return null;
  }

  static List<DappResource> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <DappResource>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = DappResource.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, DappResource> mapFromJson(dynamic json) {
    final map = <String, DappResource>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = DappResource.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of DappResource-objects as value to a dart map
  static Map<String, List<DappResource>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<DappResource>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = DappResource.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
  };
}


class DappResourceGroupEnum {
  /// Instantiate a new enum with the provided [value].
  const DappResourceGroupEnum._(this.value);

  /// The underlying value of this enum member.
  final String value;

  @override
  String toString() => value;

  String toJson() => value;

  static const dex = DappResourceGroupEnum._(r'dex');
  static const bridge = DappResourceGroupEnum._(r'bridge');
  static const staking = DappResourceGroupEnum._(r'staking');
  static const game = DappResourceGroupEnum._(r'game');
  static const other = DappResourceGroupEnum._(r'other');

  /// List of all possible values in this [enum][DappResourceGroupEnum].
  static const values = <DappResourceGroupEnum>[
    dex,
    bridge,
    staking,
    game,
    other,
  ];

  static DappResourceGroupEnum? fromJson(dynamic value) => DappResourceGroupEnumTypeTransformer().decode(value);

  static List<DappResourceGroupEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <DappResourceGroupEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = DappResourceGroupEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [DappResourceGroupEnum] to String,
/// and [decode] dynamic data back to [DappResourceGroupEnum].
class DappResourceGroupEnumTypeTransformer {
  factory DappResourceGroupEnumTypeTransformer() => _instance ??= const DappResourceGroupEnumTypeTransformer._();

  const DappResourceGroupEnumTypeTransformer._();

  String encode(DappResourceGroupEnum data) => data.value;

  /// Decodes a [dynamic value][data] to a DappResourceGroupEnum.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  DappResourceGroupEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data != null) {
      switch (data) {
        case r'dex': return DappResourceGroupEnum.dex;
        case r'bridge': return DappResourceGroupEnum.bridge;
        case r'staking': return DappResourceGroupEnum.staking;
        case r'game': return DappResourceGroupEnum.game;
        case r'other': return DappResourceGroupEnum.other;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// Singleton [DappResourceGroupEnumTypeTransformer] instance.
  static DappResourceGroupEnumTypeTransformer? _instance;
}


