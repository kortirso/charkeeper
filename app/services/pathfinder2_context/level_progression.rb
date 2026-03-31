# frozen_string_literal: true

module Pathfinder2Context
  class LevelProgression
    SKILL_BOOST_LEVEL = [3, 5, 7, 9, 11, 13, 15, 17, 19].freeze

    attr_reader :character, :level, :result

    def call(character:)
      @character = character
      @result = {}
      @level = character.data.level + 1

      if skill_boost_levels.include?(level)
        @result[:skill_boosts] = character.data.skill_boosts.merge!({ 'free' => 1 }) { |_, oldval, newval| oldval + newval }
      end
    end

    private

    def skill_boost_levels = SKILL_BOOST_LEVEL
    def merge_resolver = proc { |_, oldval, newval| [oldval, newval].max }
  end
end
