# frozen_string_literal: true

module HomebrewContext
  module Books
    class ChangeCommand < BaseCommand
      use_contract do
        config.messages.namespace = :homebrew_book

        params do
          required(:book).filled(type?: ::Homebrew::Book)
          optional(:name).filled(:string, max_size?: 50)
          optional(:public).filled(:bool)
        end
      end

      private

      def do_persist(input)
        input[:book].update!(input.slice(:name, :public))

        { result: input[:book] }
      end
    end
  end
end
