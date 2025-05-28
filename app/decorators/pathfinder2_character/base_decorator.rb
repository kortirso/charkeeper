# frozen_string_literal: true

module Pathfinder2Character
  class BaseDecorator < SimpleDelegator
    delegate :id, :name, :data, to: :__getobj__
    delegate :race, :subrace, :main_class, :classes, :subclasses, :level, :languages, :health, :selected_skills,
             :lore_skills, :background, :weapon_skills, :armor_skills, :main_ability, :perception, :class_dc,
             :saving_throws, :dying_condition_value, to: :data

    def method_missing(_method, *args); end

    def abilities
      @abilities ||= data.abilities.transform_values { |value| calc_ability_modifier(value) }
    end

    def skills
      @skills ||= [
        ['acrobatics', 'dex', 0], %w[arcana int], ['athletics', 'str', 0], %w[crafting int],
        %w[deception cha], %w[diplomacy cha], %w[intimidation cha], %w[medicine wis],
        %w[nature wis], %w[occultism int], %w[performance cha], %w[religion int],
        %w[society int], ['stealth', 'dex', 0], %w[survival wis], ['thievery', 'dex', 0],
        %w[lore1 int], %w[lore2 int]
      ].map { |item| skill_payload(item[0], item[1], item[2]) }
    end

    # rubocop: disable Metrics/AbcSize
    def saving_throws_value
      @saving_throws_value ||= {
        fortitude: abilities['con'] + profifiency_bonus(saving_throws['fortitude'], level),
        reflex: abilities['dex'] + profifiency_bonus(saving_throws['reflex'], level),
        will: abilities['wis'] + profifiency_bonus(saving_throws['will'], level)
      }
    end
    # rubocop: enable Metrics/AbcSize

    def armor_class
      # TODO: проверить надетую броню на макс dex
      # TODO: проверить надетую броню на бонус владения
      # TODO: проверить надетый щит
      @armor_class ||= 10 + abilities['dex'] + 0
    end

    def perception_value
      @perception_value ||= abilities['wis'] + perception
    end

    def class_dc_value
      @class_dc_value ||= abilities[main_ability] + class_dc
    end

    private

    def skill_payload(slug, ability, armor=nil)
      proficiency_level = (lore_skills[slug] ? lore_skills[slug]['level'] : selected_skills[slug]).to_i

      {
        slug: slug,
        name: lore_skills[slug] ? lore_skills[slug]['name'] : nil,
        ability: ability,
        level: proficiency_level,
        modifier: abilities[ability],
        prof: profifiency_bonus(proficiency_level, level),
        item: 0,
        armor: armor
      }.compact
    end

    def profifiency_bonus(proficiency_level, level)
      return 0 if proficiency_level.zero?

      level + (proficiency_level * 2)
    end

    def calc_ability_modifier(value)
      (value / 2) - 5
    end
  end
end
