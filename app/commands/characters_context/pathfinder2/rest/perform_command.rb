# frozen_string_literal: true

module CharactersContext
  module Pathfinder2
    module Rest
      class PerformCommand < BaseCommand
        use_contract do
          params do
            required(:character).filled(type?: ::Pathfinder2::Character)
            required(:constitution).filled(:integer)
            optional(:health_limit).maybe(:integer)
          end
        end

        private

        def do_prepare(input)
          data = input[:character].data

          # полное восстановление спонтанных ячеек заклинаний
          data.spent_spell_slots.transform_values! { 0 }
          data.spent_archetype_spell_slots =
            data.spent_archetype_spell_slots.to_h { |key, value| [key, value.transform_values { 0 }] }

          # восстановление здоровья
          data.health_current =
            [data.health_current + data.level + [input[:constitution], 1].max, input[:health_limit]].compact.min
        end

        def do_persist(input)
          input[:character].save!
          input[:character].feats.joins(:feat).where.not(feats: { origin: 4 }).update_all(used_count: 0) # refresh not spells
          refresh_spell_slots(input[:character])

          { result: :ok }
        end

        def refresh_spell_slots(character)
          character.feats.joins(:feat).where(feats: { origin: 4 }).find_each do |spell|
            spell.value.transform_values { |item| item['used_count'] = 0 }
            spell.save
          end
        end
      end
    end
  end
end
