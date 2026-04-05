# frozen_string_literal: true

# rubocop:disable all
module Pathfinder2Context
  module LevelProgressions
    class Ranger < Pathfinder2Context::LevelProgression
      def call(character:)
        super

        if level == 3
          @result[:saving_throws] = character.data.saving_throws.merge({ 'will' => 2 }, &merge_resolver)
        end

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
          @result[:class_dc] = [character.data.class_dc, 2].max
        end

        if level == 11
          @result[:saving_throws] = character.data.saving_throws.merge({ 'fortitude' => 3 }, &merge_resolver)
          @result[:armor_skills] =
            character.data.armor_skills.merge({ 'unarmored' => 2, 'light' => 2, 'medium' => 2 }, &merge_resolver)
        end

        if level == 15
          @result[:weapon_skills] =
            character.data.weapon_skills.merge({ 'unarmed' => 3, 'simple' => 3, 'martial' => 3 }, &merge_resolver)
          @result[:saving_throws] = character.data.saving_throws.merge({ 'reflex' => 4 }, &merge_resolver)
          @result[:selected_features] = { 'weapon' => 'greater_weapon_specialization' }
        end

        if level == 17
          @result[:class_dc] = [character.data.class_dc, 3].max
        end

        if level == 19
          @result[:armor_skills] =
            character.data.armor_skills.merge({ 'unarmored' => 3, 'light' => 3, 'medium' => 3 }, &merge_resolver)
        end

        @result
      end
    end
  end
end
