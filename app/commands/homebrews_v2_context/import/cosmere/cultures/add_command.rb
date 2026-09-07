# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Cosmere
      module Cultures
        class AddCommand < BaseCommand
          include Deps[
            cache: 'cache.cosmere_names'
          ]

          private

          def do_persist(input)
            result = ::Cosmere::Homebrews::Culture.create!(input.slice(:user, :title, :description, :public, :info))

            cache.push_item(key: :cultures, item: result)

            { result: result }
          end
        end
      end
    end
  end
end
