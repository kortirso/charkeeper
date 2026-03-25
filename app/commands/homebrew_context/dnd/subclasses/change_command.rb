# frozen_string_literal: true

module HomebrewContext
  module Dnd
    module Subclasses
      class ChangeCommand < BaseCommand
        include Deps[cache: 'cache.dnd_names']

        use_contract do
          config.messages.namespace = :homebrew_subclass

          params do
            required(:subclass).filled(type?: ::Dnd2024::Homebrew::Subclass)
            optional(:name).filled(:string, max_size?: 50)
            optional(:public).filled(:bool)
          end
        end

        private

        def do_persist(input)
          input[:subclass].assign_attributes(input.slice(:name, :public))
          input[:subclass].save!

          cache.push_item(key: :subclasses, item: input[:subclass])

          { result: input[:subclass] }
        end
      end
    end
  end
end
