# frozen_string_literal: true

module HomebrewContext
  module Books
    class ChangeCommand < BaseCommand
      use_contract do
        params do
          required(:book).filled(type?: ::Homebrew::Book)
          optional(:name).filled(:string, max_size?: 50)
          optional(:public).filled(:bool)
        end
      end

      private

      def do_prepare(input)
        return unless input.key?(:name)
        return unless ::Homebrew::Book.exists?(name: input[:name])

        input[:name] = "#{input[:name]} ##{SecureRandom.alphanumeric(6)}"
      end

      def do_persist(input)
        input[:book].update!(input.slice(:name, :public))

        { result: input[:book] }
      end
    end
  end
end
