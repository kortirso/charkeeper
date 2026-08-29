# frozen_string_literal: true

class DaggerheartDecorator < ApplicationDecoratorV2
  BASE_MODIFIERS = %w[str agi fin ins pre know].freeze
  WEAPON_KINDS = ['primary weapon', 'secondary weapon'].freeze

  def call(character:, simple: false, version: nil)
    @character = character
    @version = version
    @result = character.data.attributes
    @bonuses = {}
    @set_bonuses = {}
    @hard_set_bonuses = {}

    return self if simple

    generate_basis_abilities
    calculate_primary_modifiers
    find_modified_traits

    calculate_primary_abilities
    calculate_modifiers
    apply_modifiers
    calculate_secondary_abilities

    self
  end

  private

  def generate_basis_abilities
    @result['tier'] = find_tier
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
    @result['name'] = @character.name
    @result['proficiency'] = tier + leveling['proficiency'].to_i
    @result['armor_score'] = 0
    @result['damage_thresholds'] = { 'major' => 0, 'severe' => (equiped_armor_info ? 0 : level) }
    @result['evasion'] = evasion + leveling['evasion'].to_i + beastform_config['evasion']
    @result['health_max'] = health_max + leveling['health'].to_i
    @result['stress_max'] = stress_max + leveling['stress'].to_i
    @result['scarred_hope'] = scars.size
    @result['hope_max'] = hope_max + beastbound_pet_bonus - scarred_hope
    @result['domain_cards_max'] = 1 + level + leveling['domain_cards'].to_i + subclasses_mastery['school_of_knowledge'].to_i
    @result['advantage_dice'] = 'd6'
    @result['disadvantage_dice'] = 'd6'
    @result['resources'] = find_resources
    @result['attack'] = 0
    @result['spell_bonus'] = 0
    @result['hands_reach'] = 'melee'
    @result['spellcast_traits'] = find_spellcast_traits
    @result['use_max_trait_for_attack'] = 0
    @result['loadout'] = 5
  end

  def calculate_modifiers # rubocop: disable Metrics/AbcSize, Metrics/PerceivedComplexity, Metrics/CyclomaticComplexity, Metrics/MethodLength
    # rubocop: disable Metrics/BlockLength
    modifiers.each do |modifier|
      modifier.each do |key, value|
        next if BASE_MODIFIERS.include?(key)

        formula_result = formula.call(formula: value['value'], variables: formula_variables)
        if value['type'] == 'set'
          if key.include?('.')
            primary, secondary = key.split('.')
            @set_bonuses[primary] ||= {}
            @set_bonuses[primary][secondary] = formula_result || value['value']
          else
            @set_bonuses[key] = formula_result || value['value']
          end
        elsif value['type'] == 'hard_set'
          if key.include?('.')
            primary, secondary = key.split('.')
            @hard_set_bonuses[primary] ||= {}
            @hard_set_bonuses[primary][secondary] = formula_result || value['value']
          else
            @hard_set_bonuses[key] = formula_result || value['value']
          end
        elsif value['type'] == 'add' && formula_result
          if key.include?('.')
            primary, secondary = key.split('.')
            @bonuses[primary] ||= {}
            @bonuses[primary][secondary] ||= 0
            @bonuses[primary][secondary] += formula_result
          else
            @bonuses[key] ||= 0
            @bonuses[key] += formula_result
          end
        elsif value['type'] == 'concat'
          @result[key] ||= []
          if value['value'][0].is_a?(Array)
            @result[key].push(*value['value'])
          else
            @result[key] << value['value']
          end
          @result[key] = @result[key].uniq
        end
      end
    end
    # rubocop: enable Metrics/BlockLength
  end

  def apply_modifiers
    @result =
      @result
        .deep_merge(@set_bonuses) { |_key, _oldval, newval| newval }
        .deep_merge(@bonuses.except(*BASE_MODIFIERS)) { |_key, oldval, newval| oldval.nil? ? nil : (newval + oldval) }
        .deep_merge(@hard_set_bonuses) { |_key, _oldval, newval| newval }
  end

  def calculate_secondary_abilities # rubocop: disable Metrics/AbcSize
    @result['damage_thresholds'] = damage_thresholds.transform_values { |value| value + level }
    @result['can_have_companion'] = available_mechanics.include?('companion')
    @result['can_have_beastform'] = available_mechanics.include?('beastform')
    @result['mechanic_items'] = find_mechanic_items
    @result['transformations'] = user_homebrew.dig('daggerheart', 'transformations')
    @result['homebrew_domains'] = user_homebrew.dig('daggerheart', 'domains')
    @result['armor_slots'] = armor_score
    @result['attacks'] = find_attacks
    @result['features'] = apply_features
  end

  def find_attacks
    if beastform_config['tier'].blank?
      ([unarmed_attack] + weapons.flat_map { |item| calculate_attack(item) })
    else
      beastform_attack
    end
  end

  def beastform_attack
    beast_attack = beastform_config['attack']
    return [] unless beast_attack

    [
      {
        name: translate({ en: 'Beast attack', ru: 'Атака зверя' }),
        range: beast_attack['range'],
        trait: beast_attack['trait'],
        attack_bonus: modified_traits[beast_attack['trait']] + attack,
        damage: "#{proficiency}#{beast_attack['damage']}",
        damage_bonus: beast_attack['damage_bonus'],
        damage_type: beast_attack['damage_type'],
        kind: 'primary weapon',
        features: [],
        notes: [],
        ready_to_use: true,
        tags: { beast_attack['damage_type'] => I18n.t("tags.daggerheart.weapon.title.#{beast_attack['damage_type']}") }
      }
    ]
  end

  def unarmed_attack # rubocop: disable Metrics/AbcSize
    {
      name: translate({ en: 'Unarmed', ru: 'Безоружная' }),
      range: hands_reach,
      trait: use_max_trait_for_attack.zero? ? max_unarmed_trait : max_trait,
      attack_bonus: calculate_attack_bonus(
        (use_max_trait_for_attack.zero? ? [modified_traits['str'], modified_traits['fin']].max : max_trait_value) + attack
      ),
      damage: "#{proficiency}d4",
      damage_bonus: calculate_damage_bonus(0, 'physical'),
      damage_type: 'physical',
      kind: 'primary weapon',
      features: [],
      notes: [],
      ready_to_use: true,
      tags: { 'physical' => I18n.t('tags.daggerheart.weapon.title.physical') }
    }
  end

  def calculate_attack(item) # rubocop: disable Metrics/AbcSize, Metrics/MethodLength, Metrics/PerceivedComplexity, Metrics/CyclomaticComplexity
    response = [{
      name: translate(item[:items_name]),
      range: item[:items_info]['range'] == 'melee' && hands_reach != 'melee' ? hands_reach : item[:items_info]['range'],
      trait: use_max_trait_for_attack.zero? || item[:items_info]['trait'].nil? ? max_trait : item[:items_info]['trait'],
      attack_bonus: calculate_attack_bonus(
        (use_max_trait_for_attack.zero? ? trait_bonus(item) : max_trait_value) + attack
      ),
      damage: item[:items_info]['damage']&.gsub('d', "#{proficiency}d"),
      damage_bonus: calculate_damage_bonus(item[:items_info]['damage_bonus'], item[:items_info]['damage_type']),
      damage_type: item[:items_info]['damage_type'],
      kind: item[:items_kind],
      features: item[:items_info]['features']&.map { |item| markdown.call(value: translate(item), version: 0.5) } || [],
      notes: item[:notes] || [],
      ready_to_use: item[:state] ? item[:state].in?(::Character::Item::ACTIVE_STATES) : true,
      tags: {
        item[:items_kind].tr(' ', '_') => I18n.t("tags.daggerheart.weapon.title.#{item[:items_kind].tr(' ', '_')}"),
        item[:items_info]['damage_type'] => I18n.t("tags.daggerheart.weapon.title.#{item[:items_info]['damage_type']}")
      },
      burden: item[:items_info]['burden']
    }]

    if item[:items_info]['burden'] == 2
      response[0][:tags] = response[0][:tags].merge({ 'Two-Handed' => I18n.t('tags.daggerheart.weapon.title.Two-Handed') })
    end

    versatile = item[:items_info]['versatile']
    if versatile
      tags =
        if versatile['damage_type']
          response[0][:tags].except(response[0][:damage_type]).merge(
            versatile['damage_type'] => I18n.t("tags.daggerheart.weapon.title.#{versatile['damage_type']}")
          )
        else
          response[0][:tags]
        end
      response << response[0].merge({
        range: versatile['range'],
        attack_bonus: modified_traits[versatile['trait']],
        damage: "#{proficiency}#{versatile['damage']}",
        damage_bonus: versatile['damage_bonus'],
        damage_type: versatile['damage_type'],
        tags: tags
      })
    end

    response
  end

  def calculate_attack_bonus(attack_bonus)
    if available_features_slugs.include?('no_mercy')
      feat = available_features.find { |item| item.feat.slug == 'no_mercy' }
      attack_bonus += feat.tokens.to_i if feat
    end
    attack_bonus
  end

  def calculate_damage_bonus(damage_bonus, damage_type)
    damage_bonus += level if available_features_slugs.include?('combat_training') && damage_type == 'physical'
    damage_bonus.to_i
  end

  def trait_bonus(item)
    trait = item[:items_info]['trait']
    trait ? modified_traits[trait] : max_trait_value
  end

  def max_trait
    modified_traits.max_by { |_k, v| v }[0]
  end

  def max_unarmed_trait
    modified_traits.slice('str', 'fin').max_by { |_k, v| v }[0]
  end

  def max_trait_value
    modified_traits.values.max
  end

  def find_tier
    return 4 if level >= 8
    return 3 if level >= 5
    return 2 if level >= 2

    1
  end

  def find_resources
    @character.resources.joins(:custom_resource)
        .hashable_pluck(:id, :value, 'custom_resources.name', 'custom_resources.max_value')
  end

  def find_modified_traits
    @result['modified_traits'] =
      traits.merge(
        *[
          beastform_config['traits'],
          @bonuses.slice(*BASE_MODIFIERS),
          leveling['selected_traits'].values.flatten.tally
        ].compact
      ) { |_key, oldval, newval| newval + oldval }
  end

  def equiped_armor_info
    active_items.find { |item| item[:items_kind] == 'armor' }
  end

  def equiped_weapon_info
    active_items.find { |item| WEAPON_KINDS.include?(item[:items_kind]) }
  end

  def weapons
    character_weapons + feat_weapons
  end

  def character_weapons
    @character
      .items
      .joins(:item)
      .where(items: { kind: ['primary weapon', 'secondary weapon'] })
      .hashable_pluck('items.slug', 'items.name', 'items.kind', 'items.info', :notes, :states, :name)
  end

  def feat_weapons
    Item
      .where(itemable_type: 'Feat', itemable_id: feature_ids)
      .hashable_pluck('items.slug', 'items.name', 'items.kind', 'items.data', 'items.info')
  end

  def feature_ids
    @character.feats.joins(:feat).pluck('feats.id')
  end

  def modifiers
    @modifiers ||=
      character_modifiers + feature_modifiers +
        active_items_and_weapon_in_hands.pluck(:items_modifiers).compact_blank +
        active_items_and_weapon_in_hands.pluck(:modifiers).compact_blank
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

  def active_items_and_weapon_in_hands
    active_items.select { |item| item[:items_kind] != 'weapon' || item[:states]['hands'].positive? }
  end

  def active_items
    @active_items ||=
      @character
        .items
        .where("states->>'hands' != ? OR states->>'equipment' != ?", '0', '0')
        .joins(:item)
        .hashable_pluck('items.kind', 'items.info', 'items.modifiers', :modifiers, :states)
  end

  def available_mechanics
    @available_mechanics ||=
      subclasses.filter_map do |key, value|
        default = Daggerheart::Character.subclass_info(key, value)
        next default['mechanics'] if default

        homebrew_subclasses.find { |item| item.id == value }.info.mechanics
      end.flatten.uniq
  end

  def find_mechanic_items # rubocop: disable Metrics/AbcSize, Metrics/MethodLength, Metrics/PerceivedComplexity
    list = available_mechanics - %w[companion beastform]
    return {} if list.blank?

    mechanics = Daggerheart::Homebrews::Mechanic.where(id: list).includes(:items)
    homebrew_subclasses.each_with_object({}) do |subclass, acc|
      class_mech = subclass.info.mechanics.first
      next if class_mech.nil?

      mechanic = mechanics.find { |item| item.id == class_mech }
      next if mechanic.nil?

      acc[mechanic.id] = {
        title: translate(mechanic.title),
        description: markdown.call(value: translate(mechanic.description), version: '0.4'),
        items: mechanic.items.hashable_pluck(:id, :title, :description, :info).filter_map do |item|
          next if item[:info].tier > tier

          {
            id: item[:id],
            title: translate(item[:title]),
            description: markdown.call(value: translate(item[:description]), version: '0.4'),
            tier: item[:info].tier
          }
        end.sort_by { |item| -item[:tier] }
      }
    end
  end

  def user_homebrew
    @user_homebrew ||= @character.user.user_homebrew&.data || {}
  end

  def homebrew_subclasses
    @homebrew_subclasses ||= Daggerheart::Homebrews::Subclass.where(id: subclasses.values)
  end

  def beastbound_pet_bonus
    return 0 unless subclasses.value?('beastbound')
    return 0 unless @character.companion

    @character.companion.data.leveling['light'].to_i
  end

  def find_spellcast_traits
    return [spellcast_trait] if spellcast_trait

    traits_result = subclasses.filter_map do |key, value|
      default = Daggerheart::Character.subclass_info(key, value)
      next default['spellcast'] if default

      homebrew_subclasses.find { |item| item.id == value }.info.spellcast
    end.uniq
    return traits_result if traits_result.size <= 1

    [modified_traits.slice(*traits_result).max_by { |_k, v| v }[0]]
  end

  def available_features
    @available_features ||=
      @character.feats.includes(:feat).order('feats.origin ASC, feats.created_at ASC').where(ready_to_use: [true, nil])
  end

  def available_features_slugs
    @available_features_slugs ||= available_features.pluck('feats.slug')
  end

  def base_formula_variables
    @base_formula_variables ||=
      {
        level: level,
        tier: tier,
        no_armor: equiped_armor_info.blank?,
        no_weapon: equiped_weapon_info.blank?,
        stress_marked: stress_marked,
        health_marked: health_marked
      }.merge(subclasses_mastery.transform_keys { |key| "#{key}_mastery" })
  end

  def formula_variables
    @formula_variables ||=
      base_formula_variables
        .merge(modified_traits)
        .merge(
          proficiency: proficiency,
          spellcast: spellcast_traits[0] ? modified_traits[spellcast_traits[0]] + spell_bonus : 0
        )
  end

  def apply_features
    available_features.filter_map do |feature|
      next if feature.feat.kind == 'hidden'

      feature_payload(feature).merge(used_count: feature.used_count)
    end
  end

  def feature_payload(feature) # rubocop: disable Metrics/AbcSize, Metrics/MethodLength
    eval_limit = feature.feat.description_eval_variables['limit']
    limit = eval_limit ? formula.call(formula: eval_limit, variables: formula_variables) : nil
    tokens_max = feature.tokens ? feature.feat.tokens['limit'] : nil
    {
      id: feature.id,
      slug: feature.feat.slug || feature.id,
      kind: feature.feat.kind,
      title: translate(feature.feat.title),
      description: update_feature_description(feature.feat),
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
      tokens_max: feature.tokens ? (tokens_max || 'none') : nil,
      options: feature.feat.options
    }.compact
  end

  def update_feature_description(feat) # rubocop: disable Metrics/AbcSize
    description = translate(feat.description)
    return if description.blank?

    result = markdown.call(value: description, version: @version)
    result.scan(/\{\{([^}]+)\}\}/).flatten.each do |value|
      variable, default = value.split('|')
      default ||= ''

      formula_value = feat.description_eval_variables[variable]
      next result.gsub!("{{#{value}}}", default) unless formula_value

      formula_result = formula.call(formula: formula_value, variables: formula_variables)
      next result.gsub!("{{#{value}}}", default) unless formula_result

      result.gsub!("{{#{value}}}", formula_result.to_s)
    end
    result
  end

  def beastform_config
    @beastform_config ||= find_beastform_config
  end

  def find_beastform_config
    return { 'traits' => {}, 'evasion' => 0 } if beastform.blank?

    config = Config.data('daggerheart', 'beastforms')
    base_beastform = config.select { |_, value| value['attack'] }[beastform]
    return base_beastform if base_beastform
    return { 'traits' => {}, 'evasion' => 0 } if beast.blank?
    return legendary_beast_stats(config[beast]) if beastform == 'legendary_beast'
    return mythic_beast_stats(config[beast]) if beastform == 'mythic_beast'

    { 'traits' => {}, 'evasion' => 0 }
  end

  def legendary_beast_stats(base_beastform)
    base_beastform['traits'].transform_values! { |value| value + 1 }
    base_beastform['evasion'] += 2
    base_beastform['attack']['damage_bonus'] += 6
    base_beastform
  end

  def mythic_beast_stats(base_beastform)
    base_beastform['traits'].transform_values! { |value| value + 2 }
    base_beastform['evasion'] += 3
    base_beastform['attack']['damage_bonus'] += 9
    base_beastform['attack']['damage'] = next_dice[base_beastform.dig('attack', 'damage')]
    base_beastform
  end

  def next_dice
    {
      'd12' => 'd20',
      'd10' => 'd12',
      'd8' => 'd10',
      'd6' => 'd8',
      'd4' => 'd6'
    }
  end
end
