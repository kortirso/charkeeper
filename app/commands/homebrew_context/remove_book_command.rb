# frozen_string_literal: true

module HomebrewContext
  class RemoveBookCommand < BaseCommand
    use_contract do
      config.messages.namespace = :homebrew_book

      params do
        required(:user).filled(type?: ::User)
        required(:name).filled(:string, max_size?: 50)
      end
    end

    private

    def do_prepare(input)
      input[:book] = input[:user].homebrew_books.find_by!(name: input[:name])
    end

    def do_persist(input)
      input[:book].destroy

      { result: :ok }
    end
  end
end
