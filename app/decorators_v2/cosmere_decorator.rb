# frozen_string_literal: true

class CosmereDecorator < ApplicationDecoratorV2
  include Deps[markdown: 'markdown']
  include TranslateHelper

  ONLY_ADD_MODIFIERS = %w[str spd int wil awa pre].freeze
  WEAPON_MODIFIERS = %w[attack melee_attacks range_attacks damage melee_damage range_damage].freeze

  def call(character:, simple: false, version: nil) # rubocop: disable Metrics/AbcSize
    @character = character
    @version = version
    @result = character.data.attributes

    generate_basis
    return self if simple

    apply_add_bonuses_to_abilities
    calculate_secondary_abilities
    find_general_attack_modifiers
    find_attacks
    apply_add_modifiers

    @result['movement'] = modify_by_armor(movement)
    @result['features'] = apply_features
    @result['singer_forms'] = find_available_singer_forms
    @result['investiture_max'] = @investiture ? (2 + [modified_abilities['awa'], modified_abilities['pre']].max) : 0

    self
  end

  private

  def generate_basis
    @result['name'] = @character.name
    @result['tier'] = find_tier
  end

  def apply_add_bonuses_to_abilities
    @result['modified_abilities'] = abilities.to_h { |key, value| [key, value + find_modifiers(key, 'add').sum] }
  end

  def calculate_secondary_abilities # rubocop: disable Metrics/AbcSize
    @result['skills'] = generate_skills_payload
    @result['defense'] = {
      'physical' => 10 + modified_abilities['str'] + modified_abilities['spd'],
      'cognitive' => 10 + modified_abilities['int'] + modified_abilities['wil'],
      'spiritual' => 10 + modified_abilities['awa'] + modified_abilities['pre']
    }
    @result['deflect'] = equiped_armor&.dig(:items_info, 'deflect').to_i
    @result['health_max'] = health_max
    @result['focus_max'] = 2 + modified_abilities['wil']
    @result['load'] = find_load
    @result['movement'] = find_movement
    @result['recovery_die'] = find_recovery_die
    @result['senses_range'] = find_senses_range
    @result['talent_points'] = find_talent_points
  end

  # модификаторы атаки от обычных предметов, распространяются на всё оружие
  def find_general_attack_modifiers # rubocop: disable Metrics/AbcSize
    @general_attack_modifiers = all_modifiers.flat_map do |items|
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

  def find_attacks
    @result['attacks'] =
      ([unarmed_weapon] + weapons).flat_map do |item|
        tooltips = parse_tooltips(item.dig(:items_info, 'tooltips'))
        expert_tooltips = parse_tooltips(item.dig(:items_info, 'expert_tooltips'))

        attack_values(item, tooltips, expert_tooltips)
      end
  end

  def apply_add_modifiers # rubocop: disable Metrics/CyclomaticComplexity, Metrics/AbcSize, Metrics/PerceivedComplexity
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
          @result[primary][secondary] += value
        else
          @result[key_name] = @result[key_name] + value
        end
      end
    end
  end

  def apply_features
    available_features.filter_map { |feature| feature_payload(feature).merge(used_count: feature.used_count) }
  end

  def feature_payload(feature) # rubocop: disable Metrics/AbcSize
    allow_investiture if feature.feat.info['investiture']
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
      active: feature.active
    }.compact
  end

  def update_feature_description(feature)
    description = translate(feature.feat.description)
    return if description.blank?

    markdown.call(value: description, version: @version)
  end

  def parse_tooltips(tooltips)
    tooltips.to_h do |tooltip|
      items = tooltip.split('-')
      next items if items.size == 2

      items.push(nil)
      items
    end
  end

  def unarmed_weapon
    {
      items_slug: 'unarmed',
      items_name: { 'en' => 'Unarmed', 'ru' => 'Безоружная' },
      items_info: {
        'weapon_skill' => 'athletics',
        'type' => 'melee',
        'damage' => unarmed_damage,
        'damage_type' => 'impact',
        'tooltips' => %w[],
        'expert_tooltips' => %w[momentum offhand]
      }
    }
  end

  def unarmed_damage
    case modified_abilities['str']
    when 0, 1, 2 then '1'
    when 3, 4 then '1d4'
    when 5, 6 then '1d8'
    when 7, 8 then '2d6'
    else '2d10'
    end
  end

  def attack_values(item, tooltips, expert_tooltips) # rubocop: disable Metrics/AbcSize, Metrics/MethodLength
    attack_bonus =
      find_weapon_modifiers(item.dig(:items_info, 'type') == 'ranged' ? %w[attack range_attacks] : %w[attack melee_attacks])
    damage_bonus =
      find_weapon_modifiers(item.dig(:items_info, 'type') == 'ranged' ? %w[damage range_damage] : %w[damage melee_damage])

    damage_type = item.dig(:items_info, 'damage_type')
    skill = skills.find { |skill| skill[:slug] == item.dig(:items_info, 'weapon_skill') }
    current_tooltips = expertises['weapon'].include?(item[:items_slug]) ? expert_tooltips : tooltips
    {
      slug: item[:items_slug],
      name: translate(item[:items_name]),
      attack_bonus: skill[:modifier] + attack_bonus,
      damage: item.dig(:items_info, 'damage'),
      damage_bonus: skill[:modifier] + damage_bonus,
      notes: item[:notes],
      tags: { damage_type => I18n.t("tags.cosmere.weapon.title.#{damage_type}") }.merge(
        current_tooltips.except('reach').to_h do |key, value|
          [key, I18n.t("tags.cosmere.weapon.title.#{key}", value: value)]
        end
      ),
      ready_to_use: item[:states] ? item.dig(:states, 'hands').positive? : true,
      distance: distance(item, current_tooltips)
    }.compact
  end

  def find_weapon_modifiers(modifiers)
    @general_attack_modifiers.slice(*modifiers).values.flatten.sum
  end

  def distance(item, tooltips)
    return item.dig(:items_info, 'dist') if item.dig(:items_info, 'type') == 'ranged'
    return tooltips['thrown'] if tooltips.key?('thrown')

    tooltips.key?('reach') ? 10 : nil
  end

  def generate_skills_payload
    (
      [
        %w[agility spd], %w[athletics str], %w[heavy_weaponry str], %w[light_weaponry spd],
        %w[stealth spd], %w[thievery spd], %w[crafting int], %w[deduction int],
        %w[discipline wil], %w[intimidation wil], %w[lore int], %w[medicine int],
        %w[deception pre], %w[insight awa], %w[leadership pre], %w[perception awa],
        %w[persuation pre], %w[survival awa]
      ] +
        additional_skills.map { |(key, values)| [key, values['ability']] } +
        surge_skills
    ).map { |item| skill_payload(item[0], item[1]) }
  end

  def surge_skills
    keys = selected_skills.keys
    [
      %w[abrasion spd]
    ].select { |item| keys.include?(item[0]) }
  end

  def skill_payload(slug, ability)
    skill_level = selected_skills[slug].to_i
    {
      slug: slug,
      ability: ability,
      level: skill_level,
      modifier: skill_level + modified_abilities[ability]
    }
  end

  def find_tier
    return 5 if level >= 21
    return 4 if level >= 16
    return 3 if level >= 11
    return 2 if level >= 6

    1
  end

  def find_load
    case modified_abilities['str']
    when 0 then 50
    when 1, 2 then 100
    when 3, 4 then 250
    when 5, 6 then 500
    when 7, 8 then 2_500
    else 5_000
    end
  end

  def find_movement
    case modified_abilities['spd']
    when 0 then 20
    when 1, 2 then 25
    when 3, 4 then 30
    when 5, 6 then 40
    when 7, 8 then 60
    else 80
    end
  end

  def modify_by_armor(value)
    return value if equiped_armor.nil?

    current_tooltips =
      equiped_armor.dig(:items_info, expertises['armor'].include?(equiped_armor[:items_slug]) ? 'expert_tooltips' : 'tooltips')
    cumbersome = current_tooltips.find { |item| item.starts_with?('cumbersome') }
    return value unless cumbersome

    modified_abilities['str'] >= cumbersome.split('-')[1].to_i ? value : (value / 2)
  end

  def find_recovery_die
    case modified_abilities['wil']
    when 0 then 4
    when 1, 2 then 6
    when 3, 4 then 8
    when 5, 6 then 10
    when 7, 8 then 12
    else 20
    end
  end

  def find_senses_range
    case modified_abilities['awa']
    when 0 then 5
    when 1, 2 then 10
    when 3, 4 then 20
    when 5, 6 then 50
    when 7, 8 then 100
    end
  end

  def find_talent_points
    total = level + ((level + 4) / 5)
    total += 1 if ancestry == 'singer'
    total
  end

  def equiped_armor
    @equiped_armor ||= active_items.find { |item| item[:items_kind] == 'armor' }
  end

  def active_items
    @active_items ||=
      @character
        .items
        .where("states->>'hands' != ? OR states->>'equipment' != ?", '0', '0')
        .joins(:item)
        .hashable_pluck('items.slug', 'items.kind', 'items.data', 'items.info', 'items.modifiers', :states, :modifiers)
  end

  def weapons
    @character
      .items
      .joins(:item)
      .where(items: { kind: 'weapon' })
      .hashable_pluck(
        'items.slug', 'items.name', 'items.kind', 'items.info', 'items.modifiers', :notes, :states, :modifiers, :name
      )
  end

  def find_modifiers(key, type)
    all_modifiers.map { |item| item.dig(key, 'type') == type && item.dig(key, 'value') }.compact_blank.map(&:to_i)
  end

  def all_modifiers
    @all_modifiers ||= character_modifiers + feature_modifiers + singer_form_modifiers
  end

  def character_modifiers
    @character.bonuses.where(enabled: true).pluck(:value).flatten
  end

  def feature_modifiers
    available_features
      .hashable_pluck(:active, 'feats.continious', 'feats.modifiers')
      .select { |item| !item[:feats_continious] || item[:active] }
      .pluck(:feats_modifiers)
      .compact_blank
  end

  def singer_form_modifiers
    return [] unless ancestry == 'singer'

    [::Config.data('cosmere', 'singer_forms').dig(singer_form, 'modifiers')].compact
  end

  def available_features
    @available_features ||=
      @character
        .feats.includes(:feat)
        .order('feats.origin ASC, feats.created_at ASC')
        .where(ready_to_use: [true, nil])
  end

  def formula_variables
    @formula_variables ||=
      {
        level: level,
        tier: tier
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

  def find_available_singer_forms
    return [] unless ancestry == 'singer'

    slugs = features.pluck(:slug)
    ::Config.data('cosmere', 'singer_forms').transform_values do |value|
      next if slugs.exclude?(value['required_talent'])

      value['name'] = translate(value['name'])
      value['description'] = markdown.call(value: translate(value['description']), version: '0.4.9')
      value.slice('name', 'description')
    end.compact
  end

  def allow_investiture
    @investiture = true
  end
end
