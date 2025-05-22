# frozen_string_literal: true

module Pathfinder2Character
  class BaseDecorator < SimpleDelegator
    delegate :id, :name, :data, to: :__getobj__
    delegate :race, :subrace, :main_class, :classes, :level, :languages, :health, :abilities, :selected_skills,
             :lore_skills, to: :data

    def method_missing(_method, *args); end

    def modifiers
      @modifiers ||= abilities.transform_values { |value| calc_ability_modifier(value) }
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

    private

    def skill_payload(slug, ability, armor=nil)
      proficiency_level = (lore_skills[slug] ? lore_skills[slug]['level'] : selected_skills[slug]).to_i

      {
        slug: slug,
        name: lore_skills[slug] ? lore_skills[slug]['name'] : nil,
        ability: ability,
        level: proficiency_level,
        modifier: modifiers[ability],
        prof: level + (proficiency_level * 2),
        item: 0,
        armor: armor
      }.compact
    end

    def calc_ability_modifier(value)
      (value / 2) - 5
    end
  end
end
