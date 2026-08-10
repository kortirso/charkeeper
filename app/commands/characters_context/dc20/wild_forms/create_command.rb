# frozen_string_literal: true

module CharactersContext
  module Dc20
    module WildForms
      class CreateCommand < BaseCommand
        use_contract do
          params do
            required(:parent).filled(type?: Character)
            required(:name).filled(:string, max_size?: 50)
          end
        end

        private

        def do_prepare(input)
          input[:user] = input[:parent].user
          input[:type] = 'Dc20::WildForm'
        end

        def do_persist(input)
          wild_form = ::Dc20::WildForm.create!(input.slice(:type, :parent, :user, :name))

          { result: wild_form }
        end
      end
    end
  end
end
