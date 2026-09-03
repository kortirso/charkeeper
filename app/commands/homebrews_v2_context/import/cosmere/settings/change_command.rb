# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Cosmere
      module Settings
        class ChangeCommand < BaseCommand
          include Deps[
            cache: 'cache.cosmere_names'
          ]

          private

          def do_persist(input)
            input[:setting].update!(input.slice(:title, :description, :public))

            cache.push_item(key: :settings, item: input[:setting])

            { result: :ok }
          end
        end
      end
    end
  end
end
