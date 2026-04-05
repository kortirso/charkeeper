# frozen_string_literal: true

# rubocop:disable all
module Pathfinder2Context
  module LevelProgressions
    class Cleric < Pathfinder2Context::LevelProgression
      def call(character:)
        super

        if level == 3 && character.data.subclasses['cleric'] == 'cloistered_cleric'
          @result[:saving_throws] = character.data.saving_throws.merge({ 'fortitude' => 2 }, &merge_resolver)
        end

        if level == 3 && character.data.subclasses['cleric'] == 'warpriest'
          @result[:weapon_skills] = character.data.weapon_skills.merge({ 'martial' => 1 }, &merge_resolver)
        end

        if level == 5
          @result[:perception] = [character.data.perception, 2].max
        end

        if level == 7 && character.data.subclasses['cleric'] == 'cloistered_cleric'
          @result[:spell_dc] = [character.data.spell_dc, 2].max
          @result[:spell_attack] = [character.data.spell_attack, 2].max
        end

        if level == 7 && character.data.subclasses['cleric'] == 'warpriest'
          @result[:weapon_skills] =
            character.data.weapon_skills.merge({ 'unarmed' => 2, 'simple' => 2, 'martial' => 2 }, &merge_resolver)
        end

        if level == 9
          @result[:saving_throws] = character.data.saving_throws.merge({ 'will' => 3 }, &merge_resolver)
        end

        if level == 11
          @result[:saving_throws] = character.data.saving_throws.merge({ 'reflex' => 2 }, &merge_resolver)
        end

        if level == 11 && character.data.subclasses['cleric'] == 'cloistered_cleric'
          @result[:weapon_skills] = character.data.weapon_skills.merge({ 'unarmed' => 2, 'simple' => 2 }, &merge_resolver)
        end

        if level == 11 && character.data.subclasses['cleric'] == 'warpriest'
          @result[:spell_dc] = [character.data.spell_dc, 2].max
          @result[:spell_attack] = [character.data.spell_attack, 2].max
        end

        if level == 13
          @result[:armor_skills] = character.data.armor_skills.merge({ 'unarmored' => 2 }, &merge_resolver)
          @result[:selected_features] = { 'weapon' => 'weapon_specialization' }
        end

        if level == 15 && character.data.subclasses['cleric'] == 'cloistered_cleric'
          @result[:spell_dc] = [character.data.spell_dc, 3].max
          @result[:spell_attack] = [character.data.spell_attack, 3].max
        end

        if level == 15 && character.data.subclasses['cleric'] == 'warpriest'
          @result[:saving_throws] = character.data.saving_throws.merge({ 'fortitude' => 3 }, &merge_resolver)
        end

        if level == 19 && character.data.subclasses['cleric'] == 'cloistered_cleric'
          @result[:spell_dc] = [character.data.spell_dc, 4].max
          @result[:spell_attack] = [character.data.spell_attack, 4].max
        end

        if level == 19 && character.data.subclasses['cleric'] == 'warpriest'
          @result[:spell_dc] = [character.data.spell_dc, 3].max
          @result[:spell_attack] = [character.data.spell_attack, 3].max
        end

        @result
      end
    end
  end
end
