# frozen_string_literal: true

# rubocop:disable all
module Pathfinder2Context
  module LevelProgressions
    class Rogue < Pathfinder2Context::LevelProgression
      SKILL_BOOST_LEVEL = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20].freeze

      def call(character:)
        super

        if level == 5
          @result[:weapon_skills] =
            character.data.weapon_skills.merge({ 'unarmed' => 2, 'simple' => 2, 'martial' => 2 }, &merge_resolver)
        end

        if level == 7
          @result[:perception] = [character.data.perception, 3].max
          @result[:saving_throws] = character.data.saving_throws.merge({ 'reflex' => 3 }, &merge_resolver)
          @result[:selected_features] = { 'weapon' => 'weapon_specialization' }
        end

        if level == 9
          @result[:saving_throws] = character.data.saving_throws.merge({ 'fortitude' => 2 }, &merge_resolver)
        end

        if level == 11
          @result[:class_dc] = [character.data.class_dc, 2].max
        end

        if level == 13
          @result[:saving_throws] = character.data.saving_throws.merge({ 'reflex' => 4 }, &merge_resolver)
          @result[:perception] = [character.data.perception, 4].max
          @result[:armor_skills] = character.data.armor_skills.merge({ 'unarmored' => 2, 'light' => 2 }, &merge_resolver)
          @result[:weapon_skills] =
            character.data.weapon_skills.merge({ 'unarmed' => 3, 'simple' => 3, 'martial' => 3 }, &merge_resolver)
        end

        if level == 15
          @result[:selected_features] = { 'weapon' => 'greater_weapon_specialization' }
        end

        if level == 17
          @result[:saving_throws] = character.data.saving_throws.merge({ 'will' => 3 }, &merge_resolver)
        end

        if level == 19
          @result[:armor_skills] = character.data.armor_skills.merge({ 'unarmored' => 3, 'light' => 3 }, &merge_resolver)
          @result[:class_dc] = [character.data.class_dc, 3].max
        end

        @result
      end

      private

      def skill_boost_levels = SKILL_BOOST_LEVEL
    end
  end
end
