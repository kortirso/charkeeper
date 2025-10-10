# frozen_string_literal: true

module Dc20Character
  class BaseDecorator < SimpleDelegator
    delegate :id, :name, :data, to: :__getobj__
    delegate :abilities, :main_class, :level, :combat_expertise, :health, :classes, :attribute_points, :ancestries, :skill_levels,
             :skill_expertise, :skill_points, :skill_expertise_points, to: :data

    def parent = __getobj__
    def method_missing(_method, *args); end

    def modified_abilities
      @modified_abilities ||= abilities.merge('prime' => abilities.values.max)
    end

    def combat_mastery
      @combat_mastery ||= (level / 2.0).round
    end

    def save_dc
      @save_dc ||= 10 + modified_abilities['prime'] + combat_mastery
    end

    def precision_defense
      return @precision_defense if defined?(@precision_defense)

      default = 8 + combat_mastery + modified_abilities['agi'] + modified_abilities['int']
      @precision_defense ||= {
        default: default,
        heavy: default + 5,
        brutal: default + 10
      }
    end

    def area_defense
      return @area_defense if defined?(@area_defense)

      default = 8 + combat_mastery + modified_abilities['mig'] + modified_abilities['cha']
      @area_defense ||= {
        default: default,
        heavy: default + 5,
        brutal: default + 10
      }
    end

    def attack
      @attack ||= modified_abilities['prime'] + combat_mastery
    end

    def skills
      @skills ||= [
        %w[acrobatics agi], %w[animal cha], %w[athletics mig], %w[awareness prime],
        %w[influence cha], %w[insight cha], %w[intimidation mig], %w[investigation int],
        %w[trickery agi], %w[stealth agi], %w[medicine int], %w[survival int]
      ].map { |item| skill_payload(item[0], item[1]) }
    end

    def initiative
      @initiative ||= modified_abilities['agi'] + combat_mastery
    end

    private

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
  end
end
