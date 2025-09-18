# frozen_string_literal: true

module BotContext
  module Commands
    class Book
      include Deps[
        add_book_command: 'commands.homebrew_context.add_book',
        remove_book_command: 'commands.homebrew_context.remove_book',
        add_book_races_command: 'commands.homebrew_context.daggerheart.add_book_races',
        add_book_communities_command: 'commands.homebrew_context.daggerheart.add_book_communities',
        add_book_subclasses_command: 'commands.homebrew_context.daggerheart.add_book_subclasses',
        add_book_items_command: 'commands.homebrew_context.daggerheart.add_book_items',
        copy_book_command: 'commands.homebrew_context.copy_book'
      ]

      # rubocop: disable Metrics/CyclomaticComplexity
      def call(source:, arguments:, data:)
        return if source != :web

        case arguments.shift
        when 'create' then create_book(*arguments, data, source)
        when 'list' then fetch_books(data)
        when 'remove' then remove_book(*arguments, data)
        when 'show' then show_active_book(data, source)
        when 'set' then set_book(*arguments, data, source)
        when 'addRace' then add_race(*arguments, data, source)
        when 'addCommunity' then add_community(*arguments, data, source)
        when 'addSubclass' then add_subclass(*arguments, data, source)
        when 'addItem' then add_item(*arguments, data, source)
        when 'export' then export_book(data, source)
        when 'import' then import_book(*arguments, data)
        end
      end
      # rubocop: enable Metrics/CyclomaticComplexity

      private

      def create_book(provider, name, data, source)
        result = add_book_command.call(user: data[:user], name: name, provider: provider)
        if result[:errors_list].nil?
          ActiveBotObject.find_by(user: data[:user], source: source, object: 'book')&.destroy
          ActiveBotObject.create!(user: data[:user], source: source, object: 'book', info: { id: result[:result].id })
        end
        {
          type: 'create',
          result: result[:result],
          errors: result[:errors_list]
        }
      end

      def fetch_books(data)
        {
          type: 'list',
          result: data[:user].homebrew_books.hashable_pluck(:name, :provider),
          errors: nil
        }
      end

      def remove_book(name, data)
        result = remove_book_command.call(user: data[:user], name: name)
        {
          type: 'remove',
          result: result[:result],
          errors: result[:errors_list]
        }
      end

      def show_active_book(data, source)
        object = ActiveBotObject.find_by!(user: data[:user], source: source, object: 'book')
        {
          type: 'show',
          result: ::Homebrew::Book.find(object.info['id']),
          errors: nil
        }
      end

      def set_book(name, data, source)
        book = data[:user].homebrew_books.find_by!(name: name)
        ActiveBotObject.find_by(user: data[:user], source: source, object: 'book')&.destroy
        ActiveBotObject.create!(user: data[:user], source: source, object: 'book', info: { id: book.id })
        {
          type: 'set',
          result: book,
          errors: nil
        }
      end

      def add_race(*arguments, data, source)
        object = ActiveBotObject.find_by!(user: data[:user], source: source, object: 'book')
        add_book_races_command.call(user: data[:user], book: ::Homebrew::Book.find(object.info['id']), names: arguments)
        {
          type: 'add_race',
          result: :ok,
          errors: nil
        }
      end

      def add_community(*arguments, data, source)
        object = ActiveBotObject.find_by!(user: data[:user], source: source, object: 'book')
        add_book_communities_command.call(user: data[:user], book: ::Homebrew::Book.find(object.info['id']), names: arguments)
        {
          type: 'add_community',
          result: :ok,
          errors: nil
        }
      end

      def add_subclass(*arguments, data, source)
        object = ActiveBotObject.find_by!(user: data[:user], source: source, object: 'book')
        add_book_subclasses_command.call(user: data[:user], book: ::Homebrew::Book.find(object.info['id']), names: arguments)
        {
          type: 'add_subclass',
          result: :ok,
          errors: nil
        }
      end

      def add_item(*arguments, data, source)
        object = ActiveBotObject.find_by!(user: data[:user], source: source, object: 'book')
        add_book_items_command.call(user: data[:user], book: ::Homebrew::Book.find(object.info['id']), names: arguments)
        {
          type: 'add_item',
          result: :ok,
          errors: nil
        }
      end

      def export_book(data, source)
        object = ActiveBotObject.find_by!(user: data[:user], source: source, object: 'book')
        {
          type: 'export',
          result: ::Homebrew::Book.find(object.info['id']),
          errors: nil
        }
      end

      def import_book(id, data)
        result = copy_book_command.call(user: data[:user], id: id)
        {
          type: 'import',
          result: result[:result],
          errors: result[:errors_list]
        }
      end
    end
  end
end
