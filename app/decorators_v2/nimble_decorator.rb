# frozen_string_literal: true

class NimbleDecorator < ApplicationDecoratorV2
  BASE_MODIFIERS = %w[str dex int wil].freeze
  SKIP_MODIFIERS = %w[skills].freeze

  def call(character:, simple: false, version: nil)
    @character = character
    @version = version
    @result = character.data.attributes
    @bonuses = {}
    @set_bonuses = {}
    @hard_set_bonuses = {}

    return self if simple

    calculate_primary_modifiers

    @result = Nimble::ClassDecorator.new.call(result: @result)

    calculate_primary_abilities
    calculate_modifiers
    apply_modifiers
    calculate_secondary_abilities

    self
  end

  private

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

  def calculate_primary_abilities
    @result['modified_abilities'] = find_modified_abilities
    @result['key'] = modified_abilities.slice(*keys).values.max
    @result['wounds_max'] = 6
    @result['hit_die_max'] = level
    @result['speed'] = 6
    @result['initiative'] = modified_abilities['dex']
    @result['armor'] = calculate_armor
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
        .deep_merge(
          @bonuses.except(*(BASE_MODIFIERS + SKIP_MODIFIERS))
        ) { |_key, oldval, newval| oldval.nil? ? nil : (newval + oldval) }
        .deep_merge(@hard_set_bonuses) { |_key, _oldval, newval| newval }
  end

  def calculate_secondary_abilities
    @result['skills'] = generate_skills_payload
    @result['save_dc'] = 10 + key
    @result['inventory'] = 10 + modified_abilities['str']
    @result['attacks'] = [unarmed_attack] + character_weapons.map { |item| calculate_attack(item) }
    @result['features'] = apply_features
  end

  def unarmed_attack
    {
      name: translate({ en: 'Unarmed', ru: 'Безоружная' }),
      attack: '1d4',
      damage: 1 + modified_abilities['str'],
      damage_bonus: 0,
      damage_types: ['b'],
      ready_to_use: true
    }
  end

  def calculate_attack(item)
    {
      name: translate(item[:items_name]),
      range: item.dig(:items_info, 'range'),
      damage: item.dig(:items_info, 'damage'),
      damage_bonus: modified_abilities[item.dig(:items_info, 'weapon_skill')],
      damage_type: item.dig(:items_info, 'damage_type'),
      notes: item[:notes] || [],
      ready_to_use: item[:state] ? item[:state].in?(::Character::Item::HANDS) : true
    }.compact
  end

  def find_modified_abilities
    abilities.merge(@bonuses.slice(*BASE_MODIFIERS)) { |_key, oldval, newval| newval + oldval }
  end

  def generate_skills_payload
    Config.data('nimble', 'skills').map { |slug, values| skill_payload(slug, values) }
  end

  def skill_payload(slug, values)
    skill_level = skill_levels[slug].to_i
    modifier = modified_abilities[values['ability']] + skill_level + @bonuses['skills'].to_i
    {
      slug: slug,
      name: translate(values['name']),
      ability: values['ability'],
      modifier: modifier,
      level: skill_level
    }
  end

  def calculate_armor
    shield_bonus = equiped_shield_info&.dig('ac').to_i
    return modified_abilities['dex'] + shield_bonus if equiped_armor_info.nil?

    formula.call(formula: equiped_armor_info.dig(:items_info, 'ac'), variables: formula_variables).to_i + shield_bonus
  end

  def equiped_armor_info
    active_items.find { |item| item[:items_kind] == 'armor' }
  end

  def equiped_shield_info
    @equiped_shield_info ||= active_items.find { |item| item[:items_kind] == 'shield' }&.dig(:items_info)
  end

  def character_weapons
    @character
      .items
      .joins(:item)
      .where(items: { kind: 'weapon' })
      .hashable_pluck('items.slug', 'items.name', 'items.info', :notes, :state)
  end

  def modifiers
    @modifiers ||=
      character_modifiers + feature_modifiers + active_items_and_weapon_in_hands.pluck(:items_modifiers).compact_blank
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

  def available_features
    @available_features ||=
      @character.feats.includes(:feat).order('feats.origin ASC, feats.created_at ASC').where(ready_to_use: [true, nil])
  end

  def base_formula_variables
    @base_formula_variables ||=
      {
        level: level,
        no_armor: equiped_armor_info.nil?
      }
  end

  def formula_variables
    @formula_variables ||= base_formula_variables.merge(modified_abilities)
  end

  def final_formula_variables
    @final_formula_variables ||= formula_variables.merge({ key: key })
  end

  def apply_features
    available_features.filter_map do |feature|
      next if feature.feat.kind == 'hidden'

      feature_payload(feature).merge(used_count: feature.used_count)
    end
  end

  def feature_payload(feature) # rubocop: disable Metrics/AbcSize, Metrics/MethodLength
    limit =
      feature.feat.info['limit'] ? formula.call(formula: feature.feat.info['limit'], variables: final_formula_variables) : nil
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
      tokens_max: feature.tokens ? feature.feat.tokens['limit'] : nil,
      options: feature.feat.options,
      dice_settings: feature.feat.dices&.transform_values { |value|
        formula.call(formula: value, variables: final_formula_variables)
      },
      dices: feature.dices
    }.compact
  end

  def update_feature_description(feature) # rubocop: disable Metrics/AbcSize
    description = translate(feature.feat.description)
    return if description.blank?

    result = markdown.call(value: description, version: @version)
    result.scan(/\{\{([^}]+)\}\}/).flatten.each do |value|
      variable, default = value.split('|')

      formula_value = feature.feat.description_eval_variables[variable]
      next result.gsub!("{{#{value}}}", default) unless formula_value

      formula_result = formula.call(formula: formula_value, variables: formula_variables)
      next result.gsub!("{{#{value}}}", default) unless formula_result

      result.gsub!("{{#{value}}}", formula_result.to_s)
    end
    result
  end
end
