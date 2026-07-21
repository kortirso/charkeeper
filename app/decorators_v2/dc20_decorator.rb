# frozen_string_literal: true

class Dc20Decorator < ApplicationDecoratorV2
  BASE_MODIFIERS = %w[mig agi int cha].freeze
  CLASS_MODIFIERS = %w[max_stamina_points max_mana_points maneuver_points max_health spells].freeze
  SET_FIRST_MODIFIERS = ['speeds.ground', 'speeds.swim', 'speeds.climb', 'speeds.flight', 'speeds.glide', 'size'].freeze
  SET_FIRST_MODIFIERS_KEYS = %w[speeds size].freeze

  def call(character:, simple: false, version: nil)
    @character = character
    @version = version
    @result = character.data.attributes
    @bonuses = {}
    @set_bonuses = {}

    generate_basis_abilities
    return self if simple

    calculate_primary_modifiers
    calculate_primary_abilities

    @result = Dc20::ClassDecorator.new.call(result: @result)

    calculate_secondary_modifiers
    apply_class_modifiers
    calculate_secondary_abilities

    apply_general_modifiers
    calculate_final_abilities

    calculate_set_modifiers
    apply_set_modifiers
    calculate_set_abilities

    self
  end

  private

  def generate_basis_abilities
    @result['name'] = @character.name
    @result['combat_mastery'] = (level / 2.0).round
  end

  def calculate_primary_modifiers
    modifiers.each do |modifier|
      modifier.each do |key, value|
        next if BASE_MODIFIERS.exclude?(key)
        next if value['type'] != 'add'

        formula_result = formula.call(formula: value['value'], variables: base_formula_variables)
        next unless formula_result

        @bonuses[key] ||= 0
        @bonuses[key] += formula_result
      end
    end
  end

  def calculate_primary_abilities # rubocop: disable Metrics/AbcSize
    @result['modified_abilities'] = find_modified_abilities
    @result['skills'] = generate_skills_payload
    @result['trades'] = generate_trades_payload
    @result['mana_spend_limit'] = combat_mastery
    @result['stamina_spend_limit'] = combat_mastery
    @result['save_dc'] = 10 + modified_abilities['prime'] + combat_mastery
    @result['initiative'] = modified_abilities['agi'] + combat_mastery
    @result['jump'] = [modified_abilities['agi'], 1].max
    @result['breath'] = [modified_abilities['mig'], 1].max
  end

  def calculate_secondary_modifiers # rubocop: disable Metrics/AbcSize, Metrics/PerceivedComplexity
    modifiers.each do |modifier|
      modifier.each do |key, value|
        next if BASE_MODIFIERS.include?(key)
        next if value['type'] != 'add'

        formula_result = formula.call(formula: value['value'], variables: formula_variables)
        next unless formula_result

        if key.include?('.')
          primary, secondary = key.split('.')
          @bonuses[primary] ||= {}
          @bonuses[primary][secondary] ||= 0
          @bonuses[primary][secondary] += formula_result
        else
          @bonuses[key] ||= 0
          @bonuses[key] += formula_result
        end
      end
    end
  end

  def apply_class_modifiers
    @result = @result.merge(@bonuses.slice(*CLASS_MODIFIERS)) { |_key, oldval, newval| newval + oldval }
  end

  def calculate_secondary_abilities # rubocop: disable Metrics/AbcSize, Metrics/MethodLength
    @result['attack'] = modified_abilities['prime'] + combat_mastery
    @result['attribute_saves'] = modified_abilities.transform_values { |item| item + combat_mastery }
    @result['physical_save'] = attribute_saves.slice('mig', 'agi').values.max
    @result['mental_save'] = attribute_saves.slice('cha', 'int').values.max
    @result['pd_base'] = find_pd_base
    @result['ad_base'] = find_ad_base
    @result['grit_points'] = grit_points.merge('max' => modified_abilities['cha'] + 2)
    @result['rest_points'] = rest_points.merge('max' => max_health)
    @result['stamina_points'] = stamina_points.merge('max' => max_stamina_points + paths['martial'])
    @result['mana_points'] = mana_points.merge('max' => max_mana_points + (paths['spellcaster'] * 3))
    @result['maneuver_points'] = maneuver_points + paths['martial']
    @result['spells'] = spells + paths['spellcaster']
    @result['health'] = health.merge(
      'death_threshold' => 0 - modified_abilities['prime'] - combat_mastery,
      'max' => max_health,
      'bloodied' => max_health / 2,
      'well_bloodied' => max_health / 4
    )

    @result['damages'] = calc_resistances
    @result['attacks'] = [unarmed_attack, shield_attack].compact + character_weapons.map { |item| calculate_attack(item) }
    @result['size'] = 'medium'
    @result['features'] = apply_features
    @result['cantrips'] = 0
    @result['visions'] = { 'dark' => 0, 'blind' => 0, 'true' => 0, 'tremor' => 0 }
  end

  def apply_general_modifiers
    @result =
      @result.deep_merge(
        @bonuses.except(*(BASE_MODIFIERS + CLASS_MODIFIERS + SET_FIRST_MODIFIERS))
      ) { |_key, oldval, newval| newval + oldval }
  end

  def calculate_final_abilities
    @result['precision_defense'] = { default: pd_base, heavy: pd_base + 5, brutal: pd_base + 10 }
    @result['area_defense'] = { default: ad_base, heavy: ad_base + 5, brutal: ad_base + 10 }
    @result['speeds'] = speeds
  end

  def calculate_set_modifiers # rubocop: disable Metrics/AbcSize, Metrics/PerceivedComplexity
    modifiers.each do |modifier|
      modifier.each do |key, value|
        next if SET_FIRST_MODIFIERS.exclude?(key)
        next if value['type'] != 'set'

        formula_result = formula.call(formula: value['value'], variables: formula_variables)
        if key.include?('.')
          primary, secondary = key.split('.')
          @set_bonuses[primary] ||= {}
          @set_bonuses[primary][secondary] = formula_result || value['value']
        else
          @set_bonuses[key] = formula_result || value['value']
        end
      end
    end
  end

  def apply_set_modifiers
    @result =
      @result
        .deep_merge(@set_bonuses.slice(*SET_FIRST_MODIFIERS_KEYS)) { |_key, oldval, newval| [oldval, newval].compact.max }
        .deep_merge(@bonuses.slice(*SET_FIRST_MODIFIERS_KEYS)) { |_key, oldval, newval| oldval.nil? ? nil : (newval + oldval) }
  end

  def calculate_set_abilities
    @result['speeds'] = speeds.transform_values { |item| item&.zero? ? speeds['ground'] : item }.compact
  end

  def find_modified_abilities
    values = abilities.merge(@bonuses.slice(*BASE_MODIFIERS)) { |_key, oldval, newval| newval + oldval }
    values.merge('prime' => values.values.max)
  end

  def generate_skills_payload
    [
      %w[acrobatics agi], %w[animal cha], %w[athletics mig], %w[awareness prime],
      %w[influence cha], %w[insight cha], %w[intimidation mig], %w[investigation int],
      %w[trickery agi], %w[stealth agi], %w[medicine int], %w[survival int]
    ].map { |item| skill_payload(item[0], item[1]) }
  end

  def skill_payload(slug, ability)
    level = skill_levels[slug].to_i
    {
      slug: slug,
      ability: ability,
      modifier: modified_abilities[ability] + (level * 2),
      level: level,
      expertise: skill_expertise.include?(slug)
    }
  end

  def generate_trades_payload
    [
      %w[arcana int], %w[history int], %w[nature int], %w[occultism int], %w[religion int]
    ].map { |item| trade_payload(item[0], item[1]) } +
    trade_knowledge.map { |item| trade_payload(item[0], item[1]) }
  end

  def trade_payload(slug, ability)
    level = trade_levels[slug].to_i
    {
      slug: slug,
      ability: ability,
      modifier: modified_abilities[ability] + (level * 2),
      level: level,
      expertise: trade_expertise.include?(slug)
    }
  end

  def find_pd_base
    8 + combat_mastery + modified_abilities['agi'] + modified_abilities['int'] + equiped_armor_info&.dig('pd').to_i +
      equiped_shield_info&.dig('pd').to_i
  end

  def find_ad_base
    8 + combat_mastery + modified_abilities['mig'] + modified_abilities['cha'] + equiped_armor_info&.dig('ad').to_i +
      equiped_shield_info&.dig('ad').to_i
  end

  def unarmed_attack
    {
      name: translate({ en: 'Unarmed', ru: 'Безоружная' }),
      attack_bonus: attack,
      damage: 0,
      damage_types: ['b'],
      features: [],
      features_text: [],
      notes: [],
      ready_to_use: true,
      tags: { 'b' => I18n.t('tags.dc20.weapon.title.b'), 'Fist' => I18n.t('tags.dc20.weapon.title.Fist') }
    }
  end

  def shield_attack
    return if equiped_shield_info.nil?
    return if combat_expertise.exclude?(equiped_shield_info['type'])

    tags =
      equiped_shield_info['features']
        .index_with { |type| I18n.t("tags.dc20.weapon.title.#{type}") }
        .merge({ 'b' => I18n.t('tags.dc20.weapon.title.b') })

    {
      name: translate({ en: 'Shield attack', ru: 'Удар щитом' }),
      attack_bonus: attack,
      damage: 1,
      damage_types: ['b'],
      features: [],
      features_text: [],
      notes: [],
      ready_to_use: true,
      tags: tags
    }
  end

  def calculate_attack(item) # rubocop: disable Metrics/AbcSize
    result = {
      name: translate(item[:items_name]),
      attack_bonus: attack,
      distance: item.dig(:items_info, 'distance'),
      damage: item.dig(:items_info, 'damage'),
      damage_types: item.dig(:items_info, 'damage_types'),
      features: item.dig(:items_info, 'features'),
      notes: item[:notes] || [],
      ready_to_use: item[:state] ? item[:state].in?(::Character::Item::HANDS) : true,
      tags: item.dig(:items_info, 'damage_types').index_with { |type| I18n.t("tags.dc20.weapon.title.#{type}") }
    }

    result[:features] += item.dig(:items_info, 'styles') if combat_expertise.include?('weapon')
    result[:features_text] = result[:features].map { |feature| I18n.t("tags.dc20.weapon.#{feature}") }
    result[:tags] =
      result[:tags].merge(result[:features].index_with { |feature| I18n.t("tags.dc20.weapon.title.#{feature}") })

    result
  end

  def character_weapons
    @character
      .items
      .joins(:item)
      .where(items: { kind: 'weapon' })
      .hashable_pluck('items.slug', 'items.name', 'items.kind', 'items.info', :notes, :state)
  end

  def equiped_armor_info
    @equiped_armor_info ||=
      @character
        .items
        .where("states->>'hands' != ? OR states->>'equipment' != ?", '0', '0')
        .joins(:item)
        .where(items: { kind: 'armor' })
        .pick('items.info')
  end

  def equiped_shield_info
    @equiped_shield_info ||=
      @character
        .items
        .where("states->>'hands' != ? OR states->>'equipment' != ?", '0', '0')
        .joins(:item)
        .where(items: { kind: 'shield' })
        .pick('items.info')
  end

  def modifiers
    character_modifiers + feature_modifiers
  end

  def character_modifiers
    @character.bonuses.where(enabled: true).pluck(:value).flatten
  end

  def feature_modifiers
    available_features
      .hashable_pluck(:active, 'feats.continious', 'feats.modifiers')
      .select { |feat| !feat[:feats_continious] || feat[:active] }
      .pluck(:feats_modifiers)
      .compact_blank
  end

  def available_features
    @available_features ||=
      @character.feats.includes(:feat).order('feats.origin ASC, feats.created_at ASC').where(ready_to_use: [true, nil])
  end

  def base_formula_variables
    @base_formula_variables ||=
      {
        level: level,
        combat_mastery: combat_mastery,
        no_armor: equiped_armor_info.blank?
      }
  end

  def formula_variables
    @formula_variables ||= base_formula_variables.merge(modified_abilities)
  end

  # rubocop: disable Metrics/AbcSize, Layout/LineLength
  def calc_resistances # rubocop: disable Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity
    bonus_resistances = []
    modifiers.each do |modifier|
      modifier.each do |key, value|
        next if key != 'damages'
        next if value['type'] != 'concat'

        bonus_resistances << value['value']
      end
    end
    stack_damages(
      transform_categories(
        resistances + bonus_resistances +
          [
            equiped_armor_info.nil? || equiped_armor_info['pdr'].zero? ? nil : ['physical', 'resist', equiped_armor_info['pdr']],
            equiped_armor_info.nil? || equiped_armor_info['edr'].zero? ? nil : ['elemental', 'resist', equiped_armor_info['edr']]
          ].compact
      ).group_by { |item| item[0] }.transform_values { |value| value.map { |item| item[1..] } }
    )
  end

  # [["poison", "resist", "half"], ["elemental", "resist", "half"], ["physical", "resist", "half"]]
  def transform_categories(values)
    values.flat_map do |value|
      next [value[1..].unshift('bludge'), value[1..].unshift('pierce'), value[1..].unshift('slash')] if value[0] == 'physical'
      next [value[1..].unshift('fire'), value[1..].unshift('cold'), value[1..].unshift('lightning'), value[1..].unshift('poison'), value[1..].unshift('corrosion')] if value[0] == 'elemental'
      next [value[1..].unshift('psychic'), value[1..].unshift('radiant'), value[1..].unshift('umbral')] if value[0] == 'mystical'

      [value]
    end
  end

  # {"poison" => [["resist", "half"], ["resist", "half"]], "fire" => [["resist", "half"]], "cold" => [["resist", "half"]], "lightning" => [["resist", "half"]], "corrosion" => [["resist", "half"]], "bludge" => [["resist", "half"]], "pierce" => [["resist", "half"]], "slash" => [["resist", "half"]]}
  def stack_damages(hash) # rubocop: disable Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity
    hash.transform_values do |values|
      abs_resist, values = values.partition { |item| item[0] == 'resist' && item[1] != 'half' }
      abs_vulner, values = values.partition { |item| item[0] == 'vulner' && item[1] != 'double' }
      multi_resist, values = values.partition { |item| item[0] == 'resist' && item[1] == 'half' }
      multi_vulner, values = values.partition { |item| item[0] == 'vulner' && item[1] == 'double' }
      immune = values.select { |item| item[0] == 'immune' }
      next { immune: true } if immune.any?

      abs_resist_transforms = (abs_resist.size / 2)
      abs_resist.sort_by { |i| i[1] }.shift(abs_resist_transforms * 2)
      abs_resist_transforms.times { multi_resist.unshift(%w[resist half]) }

      abs_vulner_transforms = (abs_vulner.size / 2)
      abs_vulner.sort_by { |i| i[1] }.shift(abs_vulner_transforms * 2)
      abs_vulner_transforms.times { multi_vulner.unshift(%w[vulner double]) }

      {
        abs: abs_resist.dig(0, 1).to_i - abs_vulner.dig(0, 1).to_i,
        multi: multi_resist.size - multi_vulner.size
      }
    end
  end
  # rubocop: enable Metrics/AbcSize, Layout/LineLength

  def apply_features
    available_features.filter_map do |feature|
      next if feature.feat.kind == 'hidden'

      feature_payload(feature).merge(used_count: feature.used_count)
    end
  end

  def feature_payload(feature) # rubocop: disable Metrics/AbcSize
    limit = feature.feat.info['limit'] ? formula.call(formula: feature.feat.info['limit'], variables: formula_variables) : nil
    {
      id: feature.id,
      slug: feature.feat.slug || feature.id,
      kind: feature.feat.kind,
      title: translate(feature.feat.title),
      description: update_feature_description(feature),
      origin: feature.feat.origin,
      origin_value: feature.feat.origin_value,
      price: feature.feat.price,
      info: feature.feat.info,
      continious: feature.feat.continious,
      active: feature.active,
      limit: limit,
      limit_refresh: feature.feat.limit_refresh,
      value: feature.value,
      selected_count: feature.selected_count,
      tokens: feature.tokens,
      tokens_max: feature.tokens ? feature.feat.tokens['limit'] : nil
    }.compact
  end

  def update_feature_description(feature)
    description = translate(feature.feat.description)
    return if description.blank?

    markdown.call(value: description, version: @version)
  end
end
