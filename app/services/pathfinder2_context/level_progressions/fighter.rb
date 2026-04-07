# frozen_string_literal: true

# rubocop:disable all
module Pathfinder2Context
  module LevelProgressions
    class Fighter < Pathfinder2Context::LevelProgression
      def call(character:)
        super

        if level == 3
          @result[:saving_throws] = character.data.saving_throws.merge({ 'will' => 2 }, &merge_resolver)
        end

        if level == 7
          @result[:perception] = [character.data.perception, 3].max
          @result[:selected_features] = { 'weapon' => 'weapon_specialization' }
        end

        if level == 9
          @result[:saving_throws] = character.data.saving_throws.merge({ 'fortitude' => 3 }, &merge_resolver)
          @result[:selected_features] = { 'weapon' => 'battle_hardened' }
        end

        if level == 11
          @result[:class_dc] = [character.data.class_dc, 2].max
          @result[:armor_skills] =
            character.data.armor_skills.merge({ 'unarmored' => 2, 'light' => 2, 'medium' => 2, 'heavy' => 2 }, &merge_resolver)
        end

        if level == 13
          @result[:weapon_skills] =
            character.data.weapon_skills.merge(
              { 'unarmed' => 3, 'simple' => 3, 'martial' => 3, 'advanced' => 2 }, &merge_resolver
            )
        end

        if level == 15
          @result[:saving_throws] = character.data.saving_throws.merge({ 'reflex' => 3 }, &merge_resolver)
          @result[:selected_features] = { 'weapon' => 'greater_weapon_specialization', 'defense' => 'tempered_reflexes' }
        end

        if level == 17
          @result[:armor_skills] =
            character.data.armor_skills.merge({ 'unarmored' => 3, 'light' => 3, 'medium' => 3, 'heavy' => 3 }, &merge_resolver)
        end

        if level == 19
          @result[:weapon_skills] =
            character.data.weapon_skills.merge({ 'unarmed' => 4, 'simple' => 4, 'martial' => 4 }, &merge_resolver)
        end

        @result
      end
    end
  end
end
