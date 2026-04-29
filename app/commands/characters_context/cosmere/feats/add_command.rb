# frozen_string_literal: true

module CharactersContext
  module Cosmere
    module Feats
      class AddCommand < BaseCommand
        use_contract do
          params do
            required(:character).filled(type?: ::Cosmere::Character)
            required(:feat).filled(type?: ::Cosmere::Feat)
          end
        end

        private

        def do_persist(input)
          ::Character::Feat.create_with(ready_to_use: true).find_or_create_by(input.slice(:character, :feat))

          { result: :ok }
        end
      end
    end
  end
end
