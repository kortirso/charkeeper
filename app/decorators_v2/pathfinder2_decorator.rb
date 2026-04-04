# frozen_string_literal: true

class Pathfinder2Decorator < ApplicationDecoratorV2
  ARMOR_TYPES = %w[armor shield].freeze
  FLEXIBLE_SKILLS = %w[acrobatics athletics].freeze
  ARMOR_ABILITIES = %w[str dex].freeze
  DEFAULT_CLASSES = %w[bard cleric druid fighter ranger rogue witch wizard].freeze
  ONLY_ADD_MODIFIERS = %w[str dex con wis int cha].freeze
  WEAPON_MODIFIERS = %w[attack unarmed_attacks melee_attacks range_attacks damage unarmed_damage melee_damage range_damage].freeze
  PET_ORIGINS = [9, 10].freeze

  def call(character:, simple: false, version: nil)
    @character = character
    @version = version
    @result = character.data.attributes

    generate_basis
    return self if simple

    apply_add_bonuses_to_abilities
    calculate_secondary_abilities
    apply_set_modifiers
    find_general_attack_modifiers
    find_attacks

    @result = Pathfinder2::ClassDecorator.new.call(result: @result)

    apply_add_modifiers

    @result['features'] = apply_features
    @result['formatted_static_spells'] = format_static_spells
    @result = @result.except('selected_features', 'defense_gear')

    self
  end

  private

  def generate_basis
    @result['name'] = @character.name
    @result['raw_abilities'] = abilities.clone
    @result['abilities'] = abilities.transform_values { |value| calc_ability_modifier(value) }
    @result['spells_info'] = nil
    @result['defense_gear'] = find_defense_gear
    @result['no_body_armor'] = defense_gear[:armor].nil?
    @result['no_armor'] = defense_gear.values.all?(&:nil?)
  end

  def apply_add_bonuses_to_abilities
    @result['modified_abilities'] = abilities.to_h { |key, value| [key, value + find_modifiers(key, 'add').sum] }
  end

  def calculate_secondary_abilities # rubocop: disable Metrics/AbcSize
    @result['skills'] = generate_skills_payload
    @result['saving_throws_value'] = {
      'fortitude' => modified_abilities['con'] + proficiency_bonus(saving_throws['fortitude']),
      'reflex' => modified_abilities['dex'] + proficiency_bonus(saving_throws['reflex']),
      'will' => modified_abilities['wis'] + proficiency_bonus(saving_throws['will'])
    }
    @result['armor_class'] = calc_armor_class
    @result['speed'] = calc_speed
    @result['perception'] = modified_abilities['wis'] + proficiency_bonus(perception)
    @result['load'] = modified_abilities['str'] + 5
    @result['class_dc'] = 10 + modified_abilities[main_ability] + proficiency_bonus(class_dc.to_i)
    @result['spell_attack'] =
      spell_attack.to_i.positive? ? modified_abilities[main_ability] + proficiency_bonus(spell_attack.to_i) : 0
    @result['spell_dc'] = spell_dc.to_i.positive? ? 10 + modified_abilities[main_ability] + proficiency_bonus(spell_dc.to_i) : 0
    @result['can_have_pet'] = available_features_slugs.include?('pet')
    @result['can_have_familiar'] = available_features_slugs.include?('familiar')
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
      formula_result ? (acc[key] << formula_result) : monitoring_formula_error(formula)
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
      formula_result ? (acc[key] << formula_result) : monitoring_formula_error(formula)
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
      formula_result ? (acc[key] << formula_result) : monitoring_formula_error(formula)
    end
    res.values.flatten.sum + @general_attack_modifiers.slice(*modifiers).values.flatten.sum
  end

  def find_attacks
    @result['attacks'] = [unarmed_attack] + weapon_attacks.compact
  end

  def apply_add_modifiers # rubocop: disable Metrics/CyclomaticComplexity, Metrics/AbcSize, Metrics/MethodLength, Metrics/PerceivedComplexity
    res = all_modifiers.flat_map do |items|
      items.filter_map do |key, value|
        ONLY_ADD_MODIFIERS.exclude?(key) && WEAPON_MODIFIERS.exclude?(key) && value['type'] == 'add' && { key => value['value'] }
      end
    end.compact_blank.each_with_object({}) do |value, acc|
      key = value.keys[0]
      acc[key] ||= []
      formula_result = formula.call(formula: value[key], variables: formula_variables)
      formula_result ? (acc[key] << formula_result) : monitoring_formula_error(formula)
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

  def unarmed_attack
    attack_bonus = find_weapon_modifiers({}, {}, %w[attack unarmed_attacks])
    damage_bonus = find_weapon_modifiers({}, {}, %w[damage unarmed_damage])
    key_ability_bonus = find_key_ability_bonus('melee', ['finesse'])
    {
      slug: 'unarmed',
      name: translate({ en: 'Unarmed', ru: 'Безоружная' }),
      attack_bonus: key_ability_bonus + proficiency_bonus(weapon_skills['unarmed']) + attack_bonus,
      damage: '1d4',
      damage_bonus: modified_abilities['str'] + damage_bonus,
      tags: ['bludge'].index_with { |type| I18n.t("tags.pathfinder2.weapon.title.#{type}") }.merge(
        { 'agile' => nil, 'nonlethal' => nil }.to_h do |key, value|
          [key, I18n.t("tags.pathfinder2.weapon.title.#{key}", value: value)]
        end
      ),
      ready_to_use: true
    }
  end

  def weapon_attacks
    weapons.flat_map do |item|
      tooltips = parse_tooltips(item)

      case item[:items_info]['type']
      when 'melee' then melee_attack(item, tooltips)
      when 'range' then range_attack(item, tooltips)
      end
    end
  end

  def parse_tooltips(item)
    item[:items_info]['tooltips'].to_h do |tooltip|
      items = tooltip.split('-')
      next items if items.size == 2

      items.push(nil)
      items
    end
  end

  def melee_attack(item, tooltips) # rubocop: disable Metrics/AbcSize
    attack_bonus = find_weapon_modifiers(item[:modifiers], item[:items_modifiers], %w[attack melee_attacks])
    damage_bonus = find_weapon_modifiers(item[:modifiers], item[:items_modifiers], %w[damage melee_damage])

    key_ability_bonus = find_key_ability_bonus('melee', tooltips.keys)
    thrown_attack_bonus = tooltips.key?('thrown') ? modified_abilities['dex'] + proficiency_bonus(weapon_skills[item[:items_info]['weapon_skill']]) : nil # rubocop: disable Layout/LineLength

    attack_values(item, key_ability_bonus, tooltips, attack_bonus)
      .merge({
        thrown_attack_bonus: thrown_attack_bonus ? thrown_attack_bonus + attack_bonus : nil,
        distance: tooltips.key?('thrown') ? item[:items_info]['dist'] : (tooltips.key?('reach') ? 10 : nil), # rubocop: disable Style/NestedTernaryOperator
        damage_bonus: modified_abilities['str'] + damage_bonus
      })
  end

  def range_attack(item, tooltips) # rubocop: disable Metrics/AbcSize
    attack_bonus = find_weapon_modifiers(item[:modifiers], item[:items_modifiers], %w[attack range_attacks])
    damage_bonus = find_weapon_modifiers(item[:modifiers], item[:items_modifiers], %w[damage range_damage])

    key_ability_bonus = find_key_ability_bonus('range')
    attack_values(item, key_ability_bonus, tooltips, attack_bonus)
      .merge({
        distance: item[:items_info]['dist'],
        damage_bonus: (tooltips.key?('propulsive') ? (modified_abilities['str'].positive? ? (modified_abilities['str'] / 2) : modified_abilities['str']) : 0) + damage_bonus # rubocop: disable Style/NestedTernaryOperator, Layout/LineLength
      })
  end

  def attack_values(item, key_ability_bonus, tooltips, attack_bonus) # rubocop: disable Metrics/AbcSize
    damage_types = item[:items_info]['damage_type'].split('-')
    {
      slug: item[:items_slug],
      name: translate(item[:items_name]),
      attack_bonus: key_ability_bonus + proficiency_bonus(weapon_skills[item[:items_info]['weapon_skill']]) + attack_bonus,
      damage: item[:items_info]['damage'],
      notes: item[:notes],
      tags: damage_types.index_with { |type| I18n.t("tags.pathfinder2.weapon.title.#{type}") }.merge(
        tooltips.except('finesse', 'versatile', 'reach', 'propulsive').to_h do |key, value|
          [key, I18n.t("tags.pathfinder2.weapon.title.#{key}", value: value)]
        end
      ),
      ready_to_use: item[:state] ? item[:state].in?(::Character::Item::HANDS) : true
    }.compact
  end

  def find_key_ability_bonus(type, tooltips=[])
    return [modified_abilities['str'], modified_abilities['dex']].max if tooltips.include?('finesse')
    return modified_abilities['str'] if type == 'melee'

    modified_abilities['dex']
  end

  def proficiency_bonus(proficiency_level)
    return 0 if proficiency_level.to_i.zero?

    level + (proficiency_level * 2)
  end

  def find_modifiers(key, type)
    all_modifiers.map { |item| item.dig(key, 'type') == type && item.dig(key, 'value') }.compact_blank.map(&:to_i)
  end

  def calc_ability_modifier(value)
    (value / 2) - 5
  end

  def generate_skills_payload
    (
      [
        %w[acrobatics dex], %w[arcana int], %w[athletics str], %w[crafting int],
        %w[deception cha], %w[diplomacy cha], %w[intimidation cha], %w[medicine wis],
        %w[nature wis], %w[occultism int], %w[performance cha], %w[religion wis],
        %w[society int], %w[stealth dex], %w[survival wis], %w[thievery dex]
      ] + lores.keys.map { |item| [item, 'int'] }
    ).map { |item| skill_payload(item[0], item[1]) }
  end

  def skill_payload(slug, ability)
    proficiency_level = selected_skills[slug].to_i
    {
      slug: slug,
      ability: ability,
      level: proficiency_level,
      total_modifier: modified_abilities[ability] + proficiency_bonus(proficiency_level) + armor_penalty(slug, ability),
      modifier: modified_abilities[ability],
      prof: proficiency_bonus(proficiency_level),
      item: 0,
      armor: armor_penalty(slug, ability)
    }.compact
  end

  def calc_speed
    result = data.speed
    equiped_armor = defense_gear[:armor]
    return result if equiped_armor.nil? || equiped_armor.dig(:items_info, 'speed_penalty').nil?
    return result + equiped_armor.dig(:items_info, 'speed_penalty') unless armor_traits[:strength_enough]

    result + equiped_armor.dig(:items_info, 'speed_penalty') + 5
  end

  def calc_armor_class # rubocop: disable Metrics/AbcSize
    equiped_armor = defense_gear[:armor]
    equiped_shield = defense_gear[:shield]

    result = 10
    if equiped_armor
      result += [modified_abilities['dex'], equiped_armor.dig(:items_info, 'dex_max')].compact.min # модификатор ловкости
      result += proficiency_bonus(armor_skills[equiped_armor.dig(:items_info, 'armor_skill')]) # бонус мастерства
      result += equiped_armor.dig(:items_info, 'ac')
    else
      result += modified_abilities['dex'] # модификатор ловкости
      result += proficiency_bonus(armor_skills['unarmored']) # бонус мастерства
    end
    result += equiped_shield.dig(:items_info, 'ac') if equiped_shield

    result
  end

  def armor_penalty(slug, ability)
    equiped_armor = defense_gear[:armor]
    return 0 if equiped_armor.nil?

    skills_penalty = equiped_armor.dig(:items_info, 'skills_penalty').to_i
    return skills_penalty if slug == 'stealth' && armor_traits[:noisy]
    return 0 if slug.in?(FLEXIBLE_SKILLS) && armor_traits[:flexible]
    return skills_penalty if ability.in?(ARMOR_ABILITIES) && !armor_traits[:strength_enough]

    0
  end

  def armor_traits
    return @armor_traits if defined?(@armor_traits)

    equiped_armor = defense_gear[:armor]
    @armor_traits = {
      strength_enough: equiped_armor.nil? ||
                       equiped_armor.dig(:items_info, 'str_req').nil? ||
                       modified_abilities['str'] >= equiped_armor.dig(:items_info, 'str_req'),
      flexible: equiped_armor.nil? || equiped_armor.dig(:items_info, 'tooltips', 'flexible') || false,
      noisy: equiped_armor&.dig(:items_info, 'tooltips', 'noisy') || false
    }
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

  def format_static_spells # rubocop: disable Metrics/AbcSize, Metrics/MethodLength
    # [{"blade_ward" => {"modifier" => "int"}}]
    formatted_static_spells = {}
    available_features.pluck('feats.info').pluck('static_spells').compact.each do |custom_static_spell|
      custom_static_spell.each do |key, values|
        modifier = values['modifier'] ? modified_abilities[values['modifier']] : modified_abilities['cha']
        prof_bonus = level >= 12 ? proficiency_bonus(2) : proficiency_bonus(1)
        formatted_static_spells[key] = {
          'spell_attack' => prof_bonus + modifier,
          'spell_dc' => 10 + prof_bonus + modifier,
          'limit' => values['limit'] || 1
        }
      end
    end
    return [] if formatted_static_spells.blank?

    ::Pathfinder2::Feat.where(origin: 4, slug: formatted_static_spells.keys).map do |spell|
      static_spell = formatted_static_spells[spell.slug]

      static_spell.merge({
        ready_to_use: true,
        feat_id: spell.id,
        spell: ::Pathfinder2::SpellSerializer.new.serialize(spell)
      })
    end
  end

  def apply_features
    available_features.filter_map { |feature| perform_feature(feature) } +
      (
        equiped_items_info&.flat_map { |item|
          item[0]['features']&.map { |feature| item_feature_payload(item, feature) }
        }&.compact || []
      )
  end

  def perform_feature(feature)
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

    result = feature_payload(feature)
    result.merge(used_count: feature.used_count)
  end

  def feature_payload(feature) # rubocop: disable Metrics/AbcSize
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

  def available_features_slugs
    @available_features_slugs ||= available_features.pluck('feats.slug')
  end

  def feature_modifiers
    available_features
      .hashable_pluck(:ready_to_use, :active, 'feats.continious', 'feats.modifiers', 'feats.origin')
      .select { |item|
        PET_ORIGINS.exclude?(item[:feats_origin]) && ((!item[:feats_continious] && item[:ready_to_use]) || item[:active])
      }
      .pluck(:feats_modifiers)
      .compact_blank
  end

  def available_features
    @available_features ||=
      @character
        .feats.includes(:feat)
        .order('feats.origin ASC, feats.created_at ASC')
        .where(ready_to_use: [true, nil])
        .where.not(feats: { origin: 4 })
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

  def active_items
    @active_items ||=
      @character
        .items
        .where("states->>'hands' != ? OR states->>'equipment' != ?", '0', '0')
        .joins(:item)
        .hashable_pluck('items.kind', 'items.data', 'items.info', 'items.modifiers', :states, :modifiers)
  end

  def formula_variables
    @formula_variables ||=
      {
        level: level,
        no_body_armor: no_body_armor,
        no_armor: no_armor,
        armor_class: armor_class
      }
      .merge(modified_abilities.symbolize_keys)
  end

  def monitoring_formula_error(formula)
    Charkeeper::Container.resolve('monitoring.client').notify(
      exception: Monitoring::FormulaError.new('Formula error'),
      metadata: { formula: formula },
      severity: :info
    )
  end
end
