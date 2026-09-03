# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Cosmere
      module Settings
        class AddCommand < BaseCommand
          include Deps[
            cache: 'cache.cosmere_names'
          ]

          private

          def do_persist(input)
            result = ::Cosmere::Homebrews::Setting.create!(input.slice(:user, :title, :description, :public))

            cache.push_item(key: :settings, item: result)

            { result: result }
          end
        end
      end
    end
  end
end
