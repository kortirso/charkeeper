# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Pathfinder2
      module Backgrounds
        class ChangeCommand < BaseCommand
          include Deps[
            cache: 'cache.pathfinder2_names'
          ]

          private

          def do_persist(input)
            input[:background].update!(input.slice(:title, :description, :public, :info))

            cache.push_item(key: :communities, item: input[:background])

            { result: :ok }
          end
        end
      end
    end
  end
end
