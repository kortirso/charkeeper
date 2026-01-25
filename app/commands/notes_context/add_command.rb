# frozen_string_literal: true

module NotesContext
  class AddCommand < BaseCommand
    use_contract do
      params do
        required(:noteable).filled(type_included_in?: [::Character, ::Campaign])
        required(:value).filled(:string, max_size?: 200)
        required(:title).filled(:string, max_size?: 50)
      end
    end

    private

    def do_prepare(input)
      input[:value] = sanitize(input[:value])
    end

    def do_persist(input)
      result = input[:noteable].notes.create!(input.except(:noteable))

      { result: result }
    end
  end
end
