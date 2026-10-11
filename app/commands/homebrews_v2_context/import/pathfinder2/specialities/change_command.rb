# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Pathfinder2
      module Specialities
        class ChangeCommand < BaseCommand
          include Deps[
            cache: 'cache.pathfinder2_names'
          ]

          private

          def do_persist(input)
            input[:speciality].update!(input.slice(:title, :description, :public, :info))

            cache.push_item(key: :specialities, item: input[:speciality])

            { result: :ok }
          end
        end
      end
    end
  end
end
