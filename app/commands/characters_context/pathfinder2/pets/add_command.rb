# frozen_string_literal: true

module CharactersContext
  module Pathfinder2
    module Pets
      class AddCommand < BaseCommand
        use_contract do
          config.messages.namespace = :character_companion

          Kinds = Dry::Types['strict.string'].enum('pet', 'familiar')

          params do
            required(:character).filled(type?: ::Pathfinder2::Character)
            required(:name).filled(:string, max_size?: 50)
            required(:kind).filled(Kinds)
          end
        end

        private

        def do_prepare(input)
          input[:data] = { kind: input[:kind] }
        end

        def do_persist(input)
          result = ::Pathfinder2::Character::Pet.create!(input.except(:kind))

          { result: result }
        end
      end
    end
  end
end
