# frozen_string_literal: true

module HomebrewContext
  class CopyBookCommand < BaseCommand
    include Deps[
      copy_daggerheart_book: 'commands.homebrew_context.daggerheart.copy_book'
    ]

    use_contract do
      params do
        required(:user).filled(type?: ::User)
        required(:id).filled(:string, :uuid_v4?)
      end
    end

    private

    def do_prepare(input)
      input[:book] = Homebrew::Book.find(input[:id])
      input[:command] =
        case input[:book].provider
        when 'daggerheart' then copy_daggerheart_book
        end
    end

    def do_persist(input)
      result = input[:command].call(book: input[:book], user: input[:user])

      { result: result[:result] }
    end
  end
end
