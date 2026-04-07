# frozen_string_literal: true

# rubocop:disable all
module Pathfinder2Context
  module LevelProgressions
    class Witch < Pathfinder2Context::LevelProgression
      def call(character:)
        super

        if level == 5
          @result[:saving_throws] = character.data.saving_throws.merge({ 'fortitude' => 2 }, &merge_resolver)
        end

        if level == 7
          @result[:spell_dc] = [character.data.spell_dc, 2].max
          @result[:spell_attack] = [character.data.spell_attack, 2].max
        end

        if level == 9
          @result[:saving_throws] = character.data.saving_throws.merge({ 'reflex' => 2 }, &merge_resolver)
        end

        if level == 11
          @result[:perception] = [character.data.perception, 2].max
          @result[:weapon_skills] = character.data.weapon_skills.merge({ 'unarmed' => 2, 'simple' => 2 }, &merge_resolver)
        end

        if level == 13
          @result[:armor_skills] = character.data.armor_skills.merge({ 'unarmored' => 2 }, &merge_resolver)
          @result[:selected_features] = { 'weapon' => 'weapon_specialization' }
        end

        if level == 15
          @result[:spell_dc] = [character.data.spell_dc, 3].max
          @result[:spell_attack] = [character.data.spell_attack, 3].max
        end

        if level == 17
          @result[:saving_throws] = character.data.saving_throws.merge({ 'will' => 3 }, &merge_resolver)
          @result[:selected_features] = { 'weapon' => 'perseverance' }
        end

        if level == 19
          @result[:spell_dc] = [character.data.spell_dc, 4].max
          @result[:spell_attack] = [character.data.spell_attack, 4].max
        end

        @result
      end
    end
  end
end
