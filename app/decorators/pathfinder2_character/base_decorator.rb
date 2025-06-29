# frozen_string_literal: true

module Pathfinder2Character
  class BaseDecorator < SimpleDelegator
    FLEXIBLE_SKILLS = %w[acrobatics athletics].freeze
    ARMOR_ABILITIES = %w[str dex].freeze

    delegate :id, :name, :data, to: :__getobj__
    delegate :race, :subrace, :main_class, :classes, :subclasses, :level, :languages, :health, :selected_skills,
             :lore_skills, :background, :weapon_skills, :armor_skills, :main_ability, :class_dc,
             :saving_throws, :dying_condition_value, :ability_boosts, :skill_boosts, :coins, to: :data

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
        %w[nature wis], %w[occultism int], %w[performance cha], %w[religion int],
        %w[society int], %w[stealth dex], %w[survival wis], %w[thievery dex],
        %w[lore1 int], %w[lore2 int]
      ].map { |item| skill_payload(item[0], item[1]) }
    end

    def saving_throws_value
      @saving_throws_value ||= {
        fortitude: abilities['con'] + profifiency_bonus(saving_throws['fortitude']),
        reflex: abilities['dex'] + profifiency_bonus(saving_throws['reflex']),
        will: abilities['wis'] + profifiency_bonus(saving_throws['will'])
      }
    end

    def armor_class
      @armor_class ||= calc_armor_class
    end

    def speed
      @speed ||= calc_speed
    end

    def perception
      @perception ||= abilities['wis'] + profifiency_bonus(data.perception)
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

    private

    def skill_payload(slug, ability)
      proficiency_level = (lore_skills[slug] ? lore_skills.dig(slug, 'level') : selected_skills[slug]).to_i

      {
        slug: slug,
        name: lore_skills[slug] ? lore_skills.dig(slug, 'name') : nil,
        ability: ability,
        level: proficiency_level,
        modifier: abilities[ability],
        prof: profifiency_bonus(proficiency_level),
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

    def profifiency_bonus(proficiency_level)
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
        next "#{I18n.t('decorators.pathfinder2.free')} - #{value}" if slug == 'free'

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
        result += profifiency_bonus(armor_skills[equiped_armor.dig(:items_info, 'armor_skill')]) # бонус мастерства
        result += equiped_armor.dig(:items_info, 'ac')
      else
        result += abilities['dex'] # модификатор ловкости
        result += profifiency_bonus(armor_skills['unarmored']) # бонус мастерства
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
        .where(ready_to_use: true)
        .joins(:item)
        .where(items: { kind: %w[shield armor] })
        .hashable_pluck('items.kind', 'items.data', 'items.info')
        .partition { |item| item[:items_kind] == 'armor' }
    end

    def config = Pathfinder2::Character.config
  end
end
