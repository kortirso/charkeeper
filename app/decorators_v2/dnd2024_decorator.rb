# frozen_string_literal: true

class Dnd2024Decorator < ApplicationDecoratorV2
  SIZE_CAPACITY_MODIFIERS = {
    'tiny' => 7.5, 'small' => 15, 'medium' => 15, 'large' => 30, 'huge' => 60, 'gargantuan' => 120
  }.freeze
  ARMOR_TYPES = %w[armor shield].freeze
  DEFAULT_SPEEDS = %w[swim climb flight].freeze
  ONLY_ADD_MODIFIERS = %w[str dex con wis int cha].freeze
  WEAPON_MODIFIERS = %w[attack unarmed_attacks melee_attacks range_attacks damage unarmed_damage melee_damage range_damage].freeze
  DEFAULT_CLASSES = %w[artificer barbarian bard cleric druid fighter monk paladin ranger rogue sorcerer warlock wizard].freeze

  def call(character:, exclude_feature_origins: [], simple: false, version: nil) # rubocop: disable Metrics/MethodLength, Metrics/AbcSize
    @character = character
    @exclude_feature_origins = exclude_feature_origins
    @version = version
    @result = character.data.attributes

    generate_basis
    return self if simple

    apply_beastform_abilities
    apply_add_bonuses_to_abilities
    calculate_modifiers
    calculate_secondary_abilities
    apply_set_modifiers
    find_general_attack_modifiers
    find_attacks

    @result = Dnd2024::SpeciesDecorator.new.call(result: @result)
    @result = Dnd2024::LegacyDecorator.new.call(result: @result)
    @result = Dnd2024::ClassDecorator.new.call(result: @result)
    @result = Dnd2024::SubclassDecorator.new.call(result: @result)

    apply_add_modifiers

    @result['features'] = apply_features

    find_resistances
    update_save_dc
    update_speeds
    @result['formatted_static_spells'] = format_static_spells
    @result['resources'] = find_resources
    @result = @result.except('selected_features', 'defense_gear')

    self
  end

  private

  def find_resources
    @character.resources.joins(:custom_resource)
      .hashable_pluck(:id, :value, 'custom_resources.name', 'custom_resources.max_value')
  end

  def generate_basis # rubocop: disable Metrics/AbcSize
    @result['name'] = @character.name
    @result['background_name'] = @character.background_name
    @result['available_talents'] = (level / 4) + 1 + (level >= 19 ? 1 : 0)
    @result['proficiency_bonus'] = 2 + ((level - 1) / 4)
    @result['static_spells'] = {}
    @result['spell_classes'] = {}
    @result['attacks_per_action'] = 1
    @result['features'] = []
    @result['speeds'] = {}
    @result['defense_gear'] = find_defense_gear
    @result['no_body_armor'] = defense_gear[:armor].nil?
    @result['no_armor'] = defense_gear.values.all?(&:nil?)
  end

  def apply_beastform_abilities
    @result['modified_abilities'] =
      if beastform.blank?
        abilities.clone
      else
        abilities.merge(beast_config['abilities']) { |_key, oldval, newval| [newval, oldval].max }
      end
  end

  def apply_add_bonuses_to_abilities
    @result['modified_abilities'] = modified_abilities.to_h { |key, value| [key, value + find_modifiers(key, 'add').sum] }
  end

  def calculate_modifiers
    @result['modifiers'] = modified_abilities.transform_values { |value| calc_ability_modifier(value) }
  end

  def calculate_secondary_abilities # rubocop: disable Metrics/AbcSize
    @result['skills'] = generate_skills_payload
    @result['speed'] = beast_config['speed'] if beastform
    @result['load'] = modified_abilities['str'] * SIZE_CAPACITY_MODIFIERS[size]
    @result['initiative'] = modifiers['dex']
    @result['armor_class'] = beastform.blank? ? find_armor_class : beast_config['ac']
    @result['save_dc'] =
      beastform.blank? ? modifiers.clone : modifiers.merge(beast_config['saves']) { |_key, oldval, newval| [newval, oldval].max }
  end

  def apply_set_modifiers # rubocop: disable Metrics/AbcSize, Metrics/PerceivedComplexity, Metrics/CyclomaticComplexity
    res = all_modifiers.flat_map do |items|
      items.filter_map do |key, value|
        ONLY_ADD_MODIFIERS.exclude?(key) && WEAPON_MODIFIERS.exclude?(key) && value['type'] == 'set' && { key => value['value'] }
      end
    end.compact_blank.each_with_object({}) do |value, acc|
      key = value.keys[0]
      acc[key] ||= []
      formula_result = formula.call(formula: value[key], variables: formula_variables)
      formula_result ? (acc[key] << formula_result) : monitoring_dnd_2024_formula_error(formula)
    end

    res.each do |(key_name, values)|
      if key_name.include?('.')
        primary, secondary = key_name.split('.')
        @result[primary][secondary] = [@result[primary][secondary], *values].compact.max
      else
        @result[key_name] = [@result[key_name], *values].compact.max
      end
    end
  end

  # модификаторы атаки от обычных предметов, распространяются на всё оружие
  def find_general_attack_modifiers # rubocop: disable Metrics/AbcSize
    @general_attack_modifiers = modifiers_from_items.flat_map do |items|
      items.filter_map do |key, value|
        WEAPON_MODIFIERS.include?(key) && value['type'] == 'add' && { key => value['value'] }
      end
    end.compact_blank.each_with_object({}) do |value, acc|
      key = value.keys[0]
      acc[key] ||= []
      formula_result = formula.call(formula: value[key], variables: formula_variables)
      formula_result ? (acc[key] << formula_result) : monitoring_dnd_2024_formula_error(formula)
    end
  end

  def find_weapon_modifiers(item_list, base_list, modifiers) # rubocop: disable Metrics/AbcSize
    res = [item_list, base_list].flat_map do |items|
      items.filter_map do |key, value|
        modifiers.include?(key) && value['type'] == 'add' && { key => value['value'] }
      end
    end.compact_blank.each_with_object({}) do |value, acc|
      key = value.keys[0]
      acc[key] ||= []
      formula_result = formula.call(formula: value[key], variables: formula_variables)
      formula_result ? (acc[key] << formula_result) : monitoring_dnd_2024_formula_error(formula)
    end
    res.values.flatten.sum + @general_attack_modifiers.slice(*modifiers).values.flatten.sum
  end

  def find_attacks
    @result['attacks'] = beastform.blank? ? ([unarmed_attack] + weapon_attacks.compact) : beastform_attacks
  end

  def find_resistances
    @result['resistances'] =
      {
        resistance: resistance,
        immunity: immunity,
        vulnerability: vulnerability
      }
  end

  def update_save_dc
    @result['class_save_dc'].each { |class_saving_throw| @result['save_dc'][class_saving_throw] += proficiency_bonus }
  end

  def update_speeds # rubocop: disable Metrics/AbcSize
    str_req = defense_gear[:armor]&.dig(:items_info, 'str_req')
    if str_req && str_req > modifiers['str'] && active_features.find { |item| item.feat.slug == 'arcane_armor' }.nil?
      @result['speed'] -= 10
    end
    @result['speed'] = [@result['speed'] - (exhaustion * 5), 0].max

    @result['speeds'] =
      DEFAULT_SPEEDS.index_with { speed / 2 }.merge(speeds).transform_values { |value| value.zero? ? speed : value }
    # TODO: remove negative values
  end

  def format_static_spells # rubocop: disable Metrics/AbcSize, Metrics/MethodLength
    # [{"blade_ward" => {"modifier" => "int"}}]
    custom_static_spells = available_features.pluck('feats.info').pluck('static_spells').compact

    formatted_static_spells = static_spells
    custom_static_spells.each do |custom_static_spell|
      custom_static_spell.each do |key, values|
        modifier =
          values['modifier'].is_a?(Array) ? modifiers.slice(*values['modifier']).values.max : modifiers[values['modifier']]
        formatted_static_spells[key] = {
          'attack_bonus' => proficiency_bonus + modifier,
          'save_dc' => 8 + proficiency_bonus + modifier
        }
      end
    end
    return [] if formatted_static_spells.blank?

    ::Dnd2024::Feat.where(origin: 6, slug: formatted_static_spells.keys).map do |spell|
      static_spell = formatted_static_spells[spell.slug]

      {
        ready_to_use: true,
        feat_id: spell.id,
        spell: ::Dnd2024::SpellSerializer.new.serialize(spell).merge(data: static_spell)
      }
    end
  end

  def beastform_attacks
    beast_config['features']
  end

  def unarmed_attack
    attack_bonus = find_weapon_modifiers({}, {}, %w[attack unarmed_attacks])
    damage_bonus = find_weapon_modifiers({}, {}, %w[damage unarmed_damage])
    {
      type: 'unarmed',
      name: translate({ en: 'Unarmed', ru: 'Безоружная' }),
      attack_bonus: modifiers['str'] + proficiency_bonus + attack_bonus,
      damage: ([1 + modifiers['str'], 0].max + damage_bonus).to_s,
      damage_bonus: 0,
      kind: 'unarmed',
      tags: {},
      ready_to_use: true,
      # для обратной совместимости
      action_type: 'action', # action или bonus action
      melee_distance: 5, # дальность
      hands: '1', # используется рук
      damage_type: 'bludge',
      tooltips: [],
      caption: []
    }
  end

  def weapon_attacks
    weapons.flat_map do |item|
      case item[:items_info]['type']
      when 'melee', 'thrown' then melee_attack(item)
      when 'range' then range_attack(item, 'range')
      end
    end
  end

  # rubocop: disable Metrics/AbcSize, Metrics/MethodLength, Metrics/PerceivedComplexity, Metrics/CyclomaticComplexity
  def melee_attack(item)
    attack_bonus = find_weapon_modifiers(item[:modifiers], item[:items_modifiers], %w[attack melee_attacks])
    damage_bonus = find_weapon_modifiers(item[:modifiers], item[:items_modifiers], %w[damage melee_damage])

    captions = item[:items_info]['caption']
    captions = {} if captions.is_a?(Array)
    captions = captions.except('finesse').keys

    key_ability_bonus = find_key_ability_bonus('melee', captions)
    damage_type = item[:items_info]['damage_type']
    mastery = item[:items_info]['mastery']
    {
      type: 'melee',
      slug: item[:items_slug],
      name: item[:name] || translate(item[:items_name]),
      attack_bonus: (weapon_proficiency?(item) ? (key_ability_bonus + proficiency_bonus) : key_ability_bonus) + attack_bonus,
      distance: item[:items_info]['type'] == 'thrown' ? item[:items_info]['dist'] : (captions.include?('reach') ? 10 : nil), # rubocop: disable Style/NestedTernaryOperator
      damage: item[:items_info]['damage'].starts_with?('d') ? "1#{item[:items_info]['damage']}" : item[:items_info]['damage'],
      damage_bonus: key_ability_bonus + damage_bonus,
      kind: item[:items_kind].split[0],
      notes: item[:notes],
      tags: { damage_type => I18n.t("tags.dnd.weapon.title.#{damage_type}") }.merge(
        captions.index_with { |type| I18n.t("tags.dnd.weapon.title.#{type}") }
      ).merge(
        weapon_mastery.include?(mastery) ? { mastery => I18n.t("tags.dnd.weapon.title.#{mastery}") } : {}
      ),
      ready_to_use: item[:states] ? item[:states]['hands'].positive? : true,
      # для обратной совместимости
      damage_type: damage_type,
      action_type: 'action',
      melee_distance: captions.include?('reach') ? 10 : 5,
      tooltips: [],
      hands: captions.include?('2handed') ? '2' : '1',
      caption: captions
    }.compact
  end

  def range_attack(item, type)
    attack_bonus = find_weapon_modifiers(item[:modifiers], item[:items_modifiers], %w[attack range_attacks])
    damage_bonus = find_weapon_modifiers(item[:modifiers], item[:items_modifiers], %w[damage range_damage])

    captions = item[:items_info]['caption']
    captions = {} if captions.is_a?(Array)
    captions = captions.except('finesse').keys

    key_ability_bonus = find_key_ability_bonus('range', captions)
    damage_type = item[:items_info]['damage_type']
    mastery = item[:items_info]['mastery']
    base_bonus = key_ability_bonus + (selected_feats.include?('archery') ? 2 : 0)
    {
      type: type,
      slug: item[:items_slug],
      name: item[:name] || translate(item[:items_name]),
      attack_bonus: (weapon_proficiency?(item) ? (base_bonus + proficiency_bonus) : base_bonus) + attack_bonus,
      distance: item[:items_info]['dist'],
      damage: item[:items_info]['damage'].starts_with?('d') ? "1#{item[:items_info]['damage']}" : item[:items_info]['damage'],
      damage_bonus: key_ability_bonus + damage_bonus,
      kind: item[:items_kind].split[0],
      notes: item[:notes],
      tags: { damage_type => I18n.t("tags.dnd.weapon.title.#{damage_type}") }.merge(
        captions.index_with { |type| I18n.t("tags.dnd.weapon.title.#{type}") }
      ).merge(
        weapon_mastery.include?(mastery) ? { mastery => I18n.t("tags.dnd.weapon.title.#{mastery}") } : {}
      ),
      ready_to_use: item[:states] ? item[:states]['hands'].positive? : true,
      # для обратной совместимости
      damage_type: damage_type,
      action_type: 'action',
      range_distance: item[:items_info]['dist'],
      tooltips: [],
      hands: captions.include?('2handed') ? '2' : '1',
      caption: captions
    }
  end

  def find_key_ability_bonus(type, captions)
    return [modifiers['str'], modifiers['dex']].max if captions.include?('finesse')
    return modifiers['str'] if type == 'melee'

    modifiers['dex']
  end

  def weapon_proficiency?(item)
    weapon_core_skills&.include?(item[:items_info]['weapon_skill']) ||
      weapon_skills&.include?(item[:items_slug])
  end

  def apply_add_modifiers # rubocop: disable Metrics/CyclomaticComplexity
    res = all_modifiers.flat_map do |items|
      items.filter_map do |key, value|
        ONLY_ADD_MODIFIERS.exclude?(key) && WEAPON_MODIFIERS.exclude?(key) && value['type'] == 'add' && { key => value['value'] }
      end
    end.compact_blank.each_with_object({}) do |value, acc|
      key = value.keys[0]
      acc[key] ||= []
      formula_result = formula.call(formula: value[key], variables: formula_variables)
      formula_result ? (acc[key] << formula_result) : monitoring_dnd_2024_formula_error(formula)
    end

    res.each do |(key_name, values)|
      values.each do |value|
        if key_name.include?('.')
          primary, secondary = key_name.split('.')
          @result[primary][secondary] = @result[primary][secondary] + value
        else
          @result[key_name] = @result[key_name] + value
        end
      end
    end

    res = all_modifiers.flat_map do |items|
      items.filter_map do |key, value|
        ONLY_ADD_MODIFIERS.exclude?(key) && value['type'] == 'concat' && { key => value['value'] }
      end
    end.compact_blank.each_with_object({}) do |value, acc|
      key = value.keys[0]
      acc[key] ||= []
      acc[key] << value[key]
    end

    res.each do |(key_name, values)|
      @result[key_name] = (@result[key_name] + values).uniq
    end
  end
  # rubocop: enable Metrics/AbcSize, Metrics/MethodLength, Metrics/PerceivedComplexity, Metrics/CyclomaticComplexity

  def apply_features
    available_features.filter_map { |feature| perform_feature(feature, available_features) } +
      (
        equiped_items_info&.flat_map { |item|
          item[0]['features']&.map { |feature| item_feature_payload(item, feature) }
        }&.compact || []
      )
  end

  def perform_feature(feature, available_features)
    # добавлять статические бонусы или включенные
    if feature_bonuses_enabled?(feature)
      feature.feat.eval_variables.each do |method_name, variable|
        result = eval_variable(feature.feat, variable)
        @result[method_name] = result if result
      end
    end
    return if feature.feat.kind == 'hidden'

    feature.feat.description_eval_variables.transform_values! do |value|
      eval_variable(feature.feat, value) || value
    end

    result = feature_payload(feature, available_features)
    result.merge(used_count: feature.used_count)
  end

  def feature_payload(feature, available_features) # rubocop: disable Metrics/AbcSize
    {
      id: feature.id,
      slug: feature.feat.slug || feature.id,
      kind: feature.feat.kind,
      title: translate(feature.feat.title),
      description: update_feature_description(feature),
      limit: feature.feat.description_eval_variables['limit'],
      limit_refresh: feature.feat.limit_refresh,
      options: feature.feat.options,
      value: feature.value,
      origin: feature.feat.origin == 'parent' ? available_features.find { |f| f.feat.slug == feature.feat.origin_value }.feat.origin : feature.feat.origin, # rubocop: disable Layout/LineLength
      active: feature.active,
      continious: feature.feat.continious,
      price: feature.feat.price,
      info: feature.feat.info
    }.compact
  end

  def item_feature_payload(item, feature)
    {
      id: item[2],
      slug: item[2],
      kind: 'static',
      title: translate(item[1]),
      description: markdown.call(value: translate(feature), version: @version),
      origin: 'equipment',
      price: {},
      info: {}
    }
  end

  def update_feature_description(feature)
    description = translate(feature.feat.description)
    return if description.blank?

    result = markdown.call(value: description, version: @version)
    feature.feat.description_eval_variables.each { |key, value| result.gsub!("{{#{key}}}", value.to_s) }
    result
  end

  # rubocop: disable Security/Eval
  def eval_variable(feat, variable)
    lambda do
      eval(variable)
    end.call
  rescue StandardError, SyntaxError => e
    monitoring_feat_error(e, feat)
    nil
  end
  # rubocop: enable Security/Eval

  def monitoring_feat_error(exception, feat)
    Charkeeper::Container.resolve('monitoring.client').notify(
      exception: Monitoring::FeatVariableError.new('Feat variable error'),
      metadata: { slug: feat.slug, message: exception.message },
      severity: :info
    )
  end

  def monitoring_dnd_2024_formula_error(formula)
    Charkeeper::Container.resolve('monitoring.client').notify(
      exception: Monitoring::FormulaError.new('Formula error'),
      metadata: { formula: formula },
      severity: :info
    )
  end

  def formula_variables
    @formula_variables ||=
      {
        proficiency_bonus: proficiency_bonus,
        level: level,
        no_body_armor: no_body_armor,
        no_armor: no_armor,
        armor_class: armor_class
      }
      .merge(modifiers.symbolize_keys)
      .merge(DEFAULT_CLASSES.index_with(0).transform_keys { |key| "#{key}_level" }.symbolize_keys)
      .merge(classes.transform_keys { |key| "#{key}_level" }.symbolize_keys)
  end

  def find_armor_class # rubocop: disable Metrics/AbcSize
    equiped_armor = defense_gear[:armor]
    equiped_shield = defense_gear[:shield]
    return 10 + modifiers['dex'] + equiped_shield&.dig(:items_info, 'ac').to_i if equiped_armor.nil?

    max_dex = equiped_armor.dig(:items_info, 'max_dex')
    max_dex += 1 if max_dex.to_i.positive? && @character.data.selected_talents.key?('medium_armor_master')

    equiped_armor.dig(:items_info, 'ac').to_i +
      equiped_shield&.dig(:items_info, 'ac').to_i +
      [max_dex, modifiers['dex']].compact.min
  end

  def find_defense_gear
    armor, shield =
      active_items
        .select { |item| ARMOR_TYPES.include?(item[:items_kind]) }
        .partition { |item| item[:items_kind] != 'shield' }
    {
      armor: armor.blank? ? nil : armor[0],
      shield: shield.blank? ? nil : shield[0]
    }
  end

  def generate_skills_payload
    [
      %w[acrobatics dex], %w[animal wis], %w[arcana int], %w[athletics str],
      %w[deception cha], %w[history int], %w[insight wis], %w[intimidation cha],
      %w[investigation int], %w[medicine wis], %w[nature int], %w[perception wis],
      %w[performance cha], %w[persuasion cha], %w[religion int], %w[sleight dex],
      %w[stealth dex], %w[survival wis]
    ].map { |item| skill_payload(item[0], item[1]) }
  end

  def skill_payload(slug, ability)
    skill_level = selected_skills[slug].to_i
    skill_level = 1 if skill_level.zero? && beastform.present? && beast_config.dig('skills', slug)
    modifier = [modifiers[ability] + (skill_level * proficiency_bonus), beastform_config&.dig('skills', slug)].compact.max
    {
      slug: slug,
      ability: ability,
      modifier: modifier,
      level: skill_level,
      selected: skill_level.positive?
    }
  end

  def calc_ability_modifier(value)
    (value / 2) - 5
  end

  def find_modifiers(key, type)
    all_modifiers.map { |item| item.dig(key, 'type') == type && item.dig(key, 'value') }.compact_blank.map(&:to_i)
  end

  # бонусы персонажа - bonus.value
  # бонусы от надетых предметов и оружия в руках - modifiers
  # бонусы Character::Item - modifiers
  # бонусы навыков - modifiers
  def all_modifiers
    @all_modifiers ||=
      character_modifiers +
        active_items_with_weapon_in_hands.pluck(:items_modifiers).compact_blank +
        active_items_with_weapon_in_hands.pluck(:modifiers).compact_blank +
        feature_modifiers
  end

  def modifiers_from_items
    character_modifiers +
      active_items_without_weapon.pluck(:items_modifiers).compact_blank +
      active_items_without_weapon.pluck(:modifiers).compact_blank +
      feature_modifiers
  end

  def active_items_without_weapon
    active_items.reject { |item| item[:items_kind] == 'weapon' }
  end

  def active_items_with_weapon_in_hands
    active_items.select { |item| item[:items_kind] != 'weapon' || item[:states]['hands'].positive? }
  end

  def character_modifiers
    @character.bonuses.where(enabled: true).pluck(:value).flatten
  end

  def feature_modifiers
    available_features
      .hashable_pluck(:ready_to_use, :active, 'feats.continious', 'feats.modifiers')
      .select { |item| (!item[:feats_continious] && item[:ready_to_use]) || item[:active] }
      .pluck(:feats_modifiers)
      .compact_blank
  end

  def active_items
    @active_items ||=
      @character
        .items
        .where("states->>'hands' != ? OR states->>'equipment' != ?", '0', '0')
        .joins(:item)
        .hashable_pluck('items.kind', 'items.data', 'items.info', 'items.modifiers', :states, :modifiers)
  end

  def weapons
    @character
      .items
      .joins(:item)
      .where(items: { kind: 'weapon' })
      .hashable_pluck(
        'items.slug', 'items.name', 'items.kind', 'items.info', 'items.modifiers', :quantity, :notes, :states, :modifiers, :name
      )
  end

  def active_features
    @active_features ||= available_features.select { |feature| feature_bonuses_enabled?(feature) }
  end

  def available_features
    relation = @character.feats.includes(:feat).order('feats.origin ASC, feats.created_at ASC')
    relation = relation.where.not(feats: { origin: @exclude_feature_origins }) if @exclude_feature_origins.any?
    relation.where(ready_to_use: [true, nil])
  end

  def feature_bonuses_enabled?(feature)
    (!feature.feat.continious && feature.ready_to_use) || feature.active
  end

  def beast_config
    @beast_config ||= beastform.blank? ? { 'abilities' => {} } : Config.data('dnd2024', 'beastforms')[beastform]
  end
end
