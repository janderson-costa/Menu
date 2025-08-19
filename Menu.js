/*
	Criado por Janderson Costa em  07/01/2024.
	Descrição: Menu de contexto simples.
*/

const __itemDefaultOptions = {
	icon: null, // HTMLElement (opcional)
	id: null, // string (opcional)
	name: null, // string
	description: null, // string (opcional)
	hidden: false, // boolean (opcional)
	onClick: null, // function
	divider: false, // boolean

	// Funções geradas do item
	getIcon: null, // function
	setIcon: null, // function
	show: null, // function
	hide: null, // function
};
const __menuDefaultOptions = {
	trigger: null, // HTMLElement - Ex.: button | a | div
	items: [], // __itemDefaultOptions[]
	position: 'left', // 'left' | 'right' | 'top left' | 'top right'
	top: 0, // Ajuste de posição vertical (opcional)
	left: 0, // Ajuste de posição horizontal (opcional)
	maxHeight: null, // Altura máxima (px) do menu (opcional)
	onShow: null,
	onHide: null,
};
let __menu;

window.addEventListener('resize', event => {
	if (!__menu) return;

	// Fechar o menu se a janela for redimensionada
	destroy(__menu);
});

export default function Menu(menuDefaultOptions) {
	menuDefaultOptions = {
		...__menuDefaultOptions,
		...menuDefaultOptions,
	};

	let $menu;
	let _classVisible = '';
	let _classInvisible = '';

	const _context = {
		options: menuDefaultOptions,
		element: null,
		show,
		hide,
	};

	return _context;

	function create() {
		menuDefaultOptions.items.forEach(item => {
			item = {
				...__itemDefaultOptions,
				...item,
			};
		});

		const $menu = document.createElement('div');

		$menu.className = 'ctx-menu';
		$menu.innerHTML = /*html*/`${menuDefaultOptions.items.map(item => {
			if (item.divider) {
				return /*html*/`<div class="ctx-divider"></div>`;
			} else {
				return /*html*/`
					<div class="ctx-item" name="${item.name}">
						<div class="ctx-icon"></div>
						<div class="ctx-text">
							<div class="ctx-name">${item.name}</div>
							<div class="ctx-description">${item.description || ''}</div>
						</div>
					</div>
				`;
			}
		}).join('')}`;

		if (menuDefaultOptions.maxHeight) {
			let unit = typeof menuDefaultOptions.maxHeight == 'number' ? 'px' : '';

			$menu.style.maxHeight = menuDefaultOptions.maxHeight + unit;
		}

		// Itens
		$menu.querySelectorAll(':scope > div').forEach(($item, index) => {
			const item = menuDefaultOptions.items[index];
			const $icon = $item.querySelector('.ctx-icon');

			item.element = $item;
			$item.data = item;

			// Funções do item
			item.getIcon = () => $icon;
			item.setIcon = stringOrElement => setIcon($icon, stringOrElement);
			item.show = (show = true) => $item.classList[show ? 'remove' : 'add']('hidden');
			item.hide = (hide = true) => item.show(!hide);

			if (item.hidden)
				item.hide();
			
			if (!item.divider) {
				setIcon($icon, item.icon);

				// Evento
				$item.addEventListener('click', event => {
					hide();

					if (item.onClick)
						item.onClick(event);
				});
			}
		});

		_context.element = $menu;
		document.body.appendChild($menu);

		return $menu;
	}

	function setIcon($icon, stringOrElement) {
		if (
			typeof stringOrElement == 'undefined' ||
			stringOrElement == null
		) {
			$icon.classList.add('hidden');
			return;
		}

		$icon.innerHTML = '';

		if (typeof stringOrElement == 'string')
			$icon.innerHTML = stringOrElement;
		else if (stringOrElement instanceof HTMLElement)
			$icon.appendChild(stringOrElement);
	}

	function show(options = {}) {
		destroy($menu);

		options = {
			...menuDefaultOptions,
			...options,
		};

		let x = options.x || 0;
		let y = options.y || 0;

		$menu = create();
		_classVisible = 'ctx-menu-visible-left';
		_classInvisible = 'ctx-menu-invisible-left';

		// Posição
		setTimeout(() => { // Para que window click não feche o menu
			if (options.trigger) {
				const trigger = options.trigger;

				// Canto inferior esquerdo do trigger
				x = trigger.offsetLeft;
				y = trigger.offsetTop + trigger.offsetHeight + 1;

				if (options.position.includes('top')) {
					// Topo do trigger
					y = trigger.offsetTop - $menu.offsetHeight - 1;
				}

				if (options.position.includes('right')) {
					// Canto direito do trigger
					x = x - $menu.offsetWidth + trigger.offsetWidth - 1;
				}
			}

			if (x + $menu.offsetWidth > window.innerWidth) {
				x = x - $menu.offsetWidth;

				_classVisible = 'ctx-menu-visible-right';
				_classInvisible = 'ctx-menu-invisible-right';
			}

			if (y + $menu.offsetHeight - window.innerHeight > 0)
				y = window.innerHeight - $menu.offsetHeight;

			$menu.className = 'ctx-menu';
			$menu.classList.add(_classVisible);
			$menu.style.left = options.left + x + 'px';
			$menu.style.top = options.top + y + 'px';

			if (options.onShow)
				options.onShow(_context);
		});

		__menu = $menu;
		window.addEventListener('click', hide);
		window.addEventListener('keyup', hide);
	}

	function hide(event) {
		if (!$menu) return;

		if (event) {
			if (
				!(!event.target.closest('.ctx-menu') ||
					event.key == 'Escape')
			) return;
		}

		$menu.classList.remove(_classVisible);
		$menu.classList.add(_classInvisible);

		if (menuDefaultOptions.onHide)
			menuDefaultOptions.onHide(_context);

		setTimeout(() => destroy($menu), 200);

		window.removeEventListener('click', hide);
		window.removeEventListener('keyup', hide);
	}
};

function destroy($menu) {
	if (!$menu) return;

	$menu.remove();
	$menu = null;
}
