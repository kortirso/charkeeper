# frozen_string_literal: true

module CharactersContext
  module Pathfinder2
    module Rest
      class PerformCommand < BaseCommand
        use_contract do
          params do
            required(:character).filled(type?: ::Pathfinder2::Character)
            required(:constitution).filled(:integer)
          end
        end

        private

        def do_prepare(input)
          data = input[:character].data

          # полное восстановление ячеек заклинаний
          data.spent_spell_slots.transform_values! { 0 }

          # восстановление здоровья
          data.health['current'] = [data.health['current'] + data.level + [input[:constitution], 1].max, data.health['max']].min
        end

        def do_persist(input)
          input[:character].save!
          input[:character].feats.update_all(used_count: 0)

          { result: :ok }
        end
      end
    end
  end
end
