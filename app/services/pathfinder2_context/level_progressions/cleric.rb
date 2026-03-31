# frozen_string_literal: true

# rubocop:disable all
module Pathfinder2Context
  module LevelProgressions
    class Cleric < Pathfinder2Context::LevelProgression
      def call(character:)
        super

        if level == 5
          @result[:perception] = [character.data.perception, 2].max
        end

        if level == 9
          @result[:saving_throws] = character.data.saving_throws.merge({ 'will' => 3 }, &merge_resolver)
        end

        if level == 11
          @result[:saving_throws] = character.data.saving_throws.merge({ 'reflex' => 2 }, &merge_resolver)
        end

        if level == 13
          @result[:armor_skills] = character.data.armor_skills.merge({ 'unarmored' => 2 }, &merge_resolver)
        end

        @result
      end
    end
  end
end
