# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Cosmere
      module Cultures
        class ChangeCommand < BaseCommand
          include Deps[
            cache: 'cache.cosmere_names'
          ]

          private

          def do_persist(input)
            input[:culture].update!(input.slice(:title, :description, :public, :info))

            cache.push_item(key: :cultures, item: input[:culture])

            { result: :ok }
          end
        end
      end
    end
  end
end
