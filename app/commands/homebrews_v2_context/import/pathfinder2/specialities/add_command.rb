# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Pathfinder2
      module Specialities
        class AddCommand < BaseCommand
          include Deps[
            cache: 'cache.pathfinder2_names'
          ]

          private

          def do_persist(input)
            result = ::Pathfinder2::Homebrews::Speciality.create!(input.slice(:user, :title, :description, :public, :info))

            cache.push_item(key: :specialities, item: result)

            { result: result }
          end
        end
      end
    end
  end
end
