# frozen_string_literal: true

module Pathfinder2Character
  class BaseDecorator < SimpleDelegator
    FLEXIBLE_SKILLS = %w[acrobatics athletics].freeze
    ARMOR_ABILITIES = %w[str dex].freeze

    delegate :id, :name, :data, :feats, to: :__getobj__
    delegate :race, :subrace, :main_class, :classes, :subclasses, :level, :languages, :health, :selected_skills,
             :lore_skills, :background, :weapon_skills, :armor_skills, :main_ability, :class_dc, :conditions,
             :saving_throws, :dying_condition_value, :ability_boosts, :skill_boosts, :coins, :money, to: :data

    def parent = __getobj__
    def method_missing(_method, *args); end

    def boosts
      return if ability_boosts.nil? || skill_boosts.nil?

      I18n.t('decorators.pathfinder2.boosts', ability_boosts_text: ability_boosts_text, skill_boosts_text: skill_boosts_text)
    end

    def abilities
      @abilities ||= data.abilities.transform_values { |value| calc_ability_modifier(value) }
    end

    def skills
      @skills ||= [
        %w[acrobatics dex], %w[arcana int], %w[athletics str], %w[crafting int],
        %w[deception cha], %w[diplomacy cha], %w[intimidation cha], %w[medicine wis],
        %w[nature wis], %w[occultism int], %w[performance cha], %w[religion wis],
        %w[society int], %w[stealth dex], %w[survival wis], %w[thievery dex],
        %w[lore1 int], %w[lore2 int]
      ].map { |item| skill_payload(item[0], item[1]) }
    end

    def saving_throws_value
      @saving_throws_value ||= {
        fortitude: abilities['con'] + proficiency_bonus(saving_throws['fortitude']),
        reflex: abilities['dex'] + proficiency_bonus(saving_throws['reflex']),
        will: abilities['wis'] + proficiency_bonus(saving_throws['will'])
      }
    end

    def armor_class
      @armor_class ||= calc_armor_class
    end

    def speed
      @speed ||= calc_speed
    end

    def perception
      @perception ||= abilities['wis'] + proficiency_bonus(data.perception)
    end

    def class_dc_value
      @class_dc_value ||= abilities[main_ability] + class_dc
    end

    def load
      @load ||= abilities['str'] + 5
    end

    def defense_gear
      @defense_gear ||= calc_defense_gear
    end

    def attacks
      @attacks ||= [unarmed_attack] + weapon_attacks.flatten.compact
    end

    private

    def unarmed_attack
      key_ability_bonus = find_key_ability_bonus('melee', ['finesse'])
      {
        slug: 'unarmed',
        name: { en: 'Unarmed', ru: 'Безоружная' }[I18n.locale],
        attack_bonus: key_ability_bonus + proficiency_bonus(weapon_skills['unarmed']),
        damage: '1d4',
        damage_bonus: abilities['str'],
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

    def melee_attack(item, tooltips)
      key_ability_bonus = find_key_ability_bonus('melee', tooltips.keys)
      attack_values(item, key_ability_bonus, tooltips)
        .merge({
          thrown_attack_bonus: tooltips.key?('thrown') ? abilities['dex'] + proficiency_bonus(weapon_skills[item[:items_info]['weapon_skill']]) : nil, # rubocop: disable Layout/LineLength
          distance: tooltips.key?('thrown') ? item[:items_info]['dist'] : (tooltips.key?('reach') ? 10 : nil), # rubocop: disable Style/NestedTernaryOperator
          damage_bonus: abilities['str']
        })
    end

    def range_attack(item, tooltips)
      key_ability_bonus = find_key_ability_bonus('range')
      attack_values(item, key_ability_bonus, tooltips)
        .merge({
          distance: item[:items_info]['dist'],
          damage_bonus: tooltips.key?('propulsive') ? (abilities['str'].positive? ? (abilities['str'] / 2) : abilities['str']) : 0 # rubocop: disable Style/NestedTernaryOperator
        })
    end

    def attack_values(item, key_ability_bonus, tooltips) # rubocop: disable Metrics/AbcSize
      damage_types = item[:items_info]['damage_type'].split('-')
      {
        slug: item[:items_slug],
        name: item[:items_name][I18n.locale.to_s],
        attack_bonus: key_ability_bonus + proficiency_bonus(weapon_skills[item[:items_info]['weapon_skill']]),
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
      return [abilities['str'], abilities['dex']].max if tooltips.include?('finesse')
      return abilities['str'] if type == 'melee'

      abilities['dex']
    end

    def weapons
      __getobj__
        .items
        .joins(:item)
        .where(items: { kind: 'weapon' })
        .hashable_pluck('items.slug', 'items.name', 'items.data', 'items.info', :notes, :state)
    end

    def skill_payload(slug, ability) # rubocop: disable Metrics/AbcSize
      proficiency_level = (lore_skills[slug] ? lore_skills.dig(slug, 'level') : selected_skills[slug]).to_i

      {
        slug: slug,
        name: lore_skills[slug] ? lore_skills.dig(slug, 'name') : nil,
        ability: ability,
        level: proficiency_level,
        total_modifier: abilities[ability] + proficiency_bonus(proficiency_level) + armor_penalty(slug, ability),
        modifier: abilities[ability],
        prof: proficiency_bonus(proficiency_level),
        item: 0,
        armor: armor_penalty(slug, ability)
      }.compact
    end

    def armor_penalty(slug, ability)
      equiped_armor = defense_gear[:armor]
      return 0 if equiped_armor.nil?
      return equiped_armor.dig(:items_info, 'skills_penalty') if slug == 'stealth' && armor_traits[:noisy]
      return 0 if slug.in?(FLEXIBLE_SKILLS) && armor_traits[:flexible]
      return equiped_armor.dig(:items_info, 'skills_penalty') if ability.in?(ARMOR_ABILITIES) && !armor_traits[:strength_enough]

      0
    end

    def armor_traits
      return @armor_traits if defined?(@armor_traits)

      equiped_armor = defense_gear[:armor]
      @armor_traits = {
        strength_enough: equiped_armor.nil? ||
                         equiped_armor.dig(:items_info, 'str_req').nil? ||
                         abilities['str'] >= equiped_armor.dig(:items_info, 'str_req'),
        flexible: equiped_armor.nil? || equiped_armor.dig(:items_info, 'tooltips', 'flexible') || false,
        noisy: equiped_armor&.dig(:items_info, 'tooltips', 'noisy') || false
      }
    end

    def proficiency_bonus(proficiency_level)
      return 0 if proficiency_level.to_i.zero?

      level + (proficiency_level * 2)
    end

    def calc_ability_modifier(value)
      (value / 2) - 5
    end

    def ability_boosts_text
      transform_boosts(ability_boosts, 'abilities').join(', ')
    end

    def skill_boosts_text
      transform_boosts(skill_boosts, 'skills').join(', ')
    end

    def transform_boosts(boosts, key)
      boosts.map do |slug, value|
        if slug == 'free'
          next "#{I18n.t('decorators.pathfinder2.free')} - #{value} (#{I18n.t('decorators.pathfinder2.int')})" if key == 'skills'

          next "#{I18n.t('decorators.pathfinder2.free')} - #{value}"
        end

        slugs = slug.split('_').map { |item| config.dig(key, item, 'name', I18n.locale.to_s) }.join('/')
        "#{slugs} - #{value}"
      end
    end

    def calc_speed
      result = data.speed
      equiped_armor = defense_gear[:armor]
      return result if equiped_armor.nil? || equiped_armor.dig(:items_info, 'speed_penalty').nil?
      return result + equiped_armor.dig(:items_info, 'speed_penalty') unless armor_traits[:strength_enough]

      result + equiped_armor.dig(:items_info, 'speed_penalty') + 5
    end

    # rubocop: disable Metrics/AbcSize
    def calc_armor_class
      equiped_armor = defense_gear[:armor]
      equiped_shield = defense_gear[:shield]

      result = 10
      if equiped_armor
        result += [abilities['dex'], equiped_armor.dig(:items_info, 'dex_max')].compact.min # модификатор ловкости
        result += proficiency_bonus(armor_skills[equiped_armor.dig(:items_info, 'armor_skill')]) # бонус мастерства
        result += equiped_armor.dig(:items_info, 'ac')
      else
        result += abilities['dex'] # модификатор ловкости
        result += proficiency_bonus(armor_skills['unarmored']) # бонус мастерства
      end
      result += equiped_shield.dig(:items_info, 'ac') if equiped_shield

      result
    end
    # rubocop: enable Metrics/AbcSize

    def calc_defense_gear
      armor, shield = equiped_armor_items
      {
        armor: armor.blank? ? nil : armor[0],
        shield: shield.blank? ? nil : shield[0]
      }
    end

    def equiped_armor_items
      __getobj__
        .items
        .where(state: ::Character::Item::ACTIVE_STATES)
        .joins(:item)
        .where(items: { kind: %w[shield armor] })
        .hashable_pluck('items.kind', 'items.data', 'items.info')
        .partition { |item| item[:items_kind] == 'armor' }
    end

    def config = Pathfinder2::Character.config
  end
end
