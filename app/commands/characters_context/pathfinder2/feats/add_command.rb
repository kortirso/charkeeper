# frozen_string_literal: true

module CharactersContext
  module Pathfinder2
    module Feats
      class AddCommand < BaseCommand
        use_contract do
          params do
            required(:character).filled(type?: ::Pathfinder2::Character)
            required(:feat).filled(type?: ::Pathfinder2::Feat)
          end
        end

        private

        def do_persist(input)
          return { result: :ok } if ::Character::Feat.exists?(input)

          ::Character::Feat.create!(input.merge(ready_to_use: true))

          { result: :ok }
        end
      end
    end
  end
end
