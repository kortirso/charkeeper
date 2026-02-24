# frozen_string_literal: true

module FalloutCharacter
  class BaseDecorator < SimpleDelegator
    delegate :data, to: :__getobj__
    delegate :abilities, :tag_skills, to: :data

    def method_missing(method, *args) # rubocop: disable Lint/UnusedMethodArgument
      __getobj__.respond_to?(method.to_sym) ? __getobj__.public_send(method) : nil
    end

    def carry_weight
      150 + (abilities['str'] * 10)
    end

    def initiative
      abilities['per'] + abilities['agi']
    end

    def health
      abilities['end'] + abilities['lck']
    end

    def skills
      @skills ||= [
        %w[athletics str], %w[barter cha], %w[big_guns end], %w[energy_weapons per], %w[explosives per],
        %w[lockpick per], %w[medicine int], %w[melee_weapons str], %w[pilot per], %w[repair int],
        %w[science int], %w[small_guns agi], %w[sneak agi], %w[speech cha], %w[survival end],
        %w[throwing agi], %w[unarmed str]
      ].map { |item| skill_payload(item[0], item[1]) }
    end

    private

    def skill_payload(slug, ability)
      level = data.skills[slug].to_i
      expertise = tag_skills.include?(slug)
      {
        slug: slug,
        ability: ability,
        modifier: [level + (expertise ? 2 : 0), 6].min,
        level: level,
        expertise: expertise
      }
    end
  end
end
