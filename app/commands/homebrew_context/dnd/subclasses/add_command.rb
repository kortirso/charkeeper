# frozen_string_literal: true

module HomebrewContext
  module Dnd
    module Subclasses
      class AddCommand < BaseCommand
        include Deps[cache: 'cache.dnd_names']

        use_contract do
          config.messages.namespace = :homebrew_subclass

          params do
            required(:user).filled(type?: ::User)
            required(:name).filled(:string, max_size?: 50)
            required(:class_name).filled(:string)
            optional(:public).filled(:bool)
          end
        end

        private

        def do_prepare(input)
          input[:attributes] = input.slice(:user, :name, :class_name, :public)
          input[:data] = {}
        end

        def do_persist(input)
          result = ::Dnd2024::Homebrew::Subclass.create!(input[:attributes].merge(input[:data]))

          cache.push_item(key: :subclasses, item: result)

          { result: result }
        end
      end
    end
  end
end
